import {
  IBuilder,
  IClient,
  ICommand,
  IKeyPair,
  ITransactionDescriptor,
  IUnsignedCommand,
  Pact,
  createClient,
  createSignWithKeypair,
  isSignedTransaction,
} from '@kadena/client';
import { getCmdDataOrFail } from '@pact-toolbox/client-utils';
import {
  KeysetConfig,
  NetworkConfig,
  PactConfig,
  PactToolboxConfigObj,
  createRpcUrlGetter,
  defaultMeta,
  getCurrentNetworkConfig,
  isLocalNetwork,
} from '@pact-toolbox/config';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

export interface DeployContractParams {
  upgrade?: boolean;
  preflight?: boolean;
  listen?: boolean;
  init?: boolean;
  namespace?: string;
  keysets?: Record<string, KeysetConfig>;
  signer?: string;
  data?: Record<string, unknown>;
  caps?: string[][];
  skipSign?: boolean;
}

export interface LocalOptions {
  preflight?: boolean;
  signatureVerification?: boolean;
}

export class PactToolboxClient {
  private kdaClient: IClient;
  private networkConfig: NetworkConfig;
  private pactConfig: Required<PactConfig>;

  constructor(private config: Required<PactToolboxConfigObj>) {
    this.networkConfig = getCurrentNetworkConfig(config);
    this.pactConfig = config.pact as Required<PactConfig>;
    this.kdaClient = createClient(createRpcUrlGetter(this.networkConfig));
  }

  get network() {
    return this.networkConfig;
  }

  isLocalNetwork() {
    return isLocalNetwork(this.networkConfig);
  }

  getConfig() {
    return this.config;
  }

  getSigner(address: string = this.networkConfig.senderAccount) {
    const s = this.networkConfig.signers.find((s) => s.account === address);
    if (!s) {
      throw new Error(`Signer ${address} not found in network accounts`);
    }
    return s;
  }

  execution<T extends IBuilder<any>>(command: string): T {
    return Pact.builder
      .execution(command)
      .setMeta({
        ...defaultMeta,
        chainId: this.networkConfig.chainId,
        senderAccount: this.networkConfig.senderAccount,
        ttl: this.networkConfig.ttl,
        gasLimit: this.networkConfig.gasLimit,
        gasPrice: this.networkConfig.gasPrice,
      })
      .setNetworkId(this.networkConfig.networkId) as T;
  }

  async sign(tx: IUnsignedCommand, keyPair?: IKeyPair) {
    const senderKeys = keyPair ?? this.getSigner(this.networkConfig.senderAccount);
    if (!senderKeys) {
      throw new Error(`Signer ${this.networkConfig.senderAccount} not found in network accounts`);
    }
    return createSignWithKeypair(senderKeys)(tx);
  }

  async dirtyRead<T>(tx: IUnsignedCommand | ICommand) {
    const res = await this.kdaClient.dirtyRead(tx);
    return getCmdDataOrFail<T>(res);
  }

  async local<T>(tx: IUnsignedCommand | ICommand, options?: LocalOptions) {
    const res = await this.kdaClient.local(tx, options);
    return getCmdDataOrFail<T>(res);
  }

  async preflight(tx: IUnsignedCommand | ICommand): ReturnType<IClient['preflight']> {
    return this.kdaClient.preflight(tx);
  }

  async submit(tx: ICommand | IUnsignedCommand) {
    if (isSignedTransaction(tx)) {
      return this.kdaClient.submit(tx);
    } else {
      throw new Error('Transaction must be signed');
    }
  }

  async listen<T>(request: ITransactionDescriptor) {
    const res = await this.kdaClient.listen(request);
    return getCmdDataOrFail<T>(res);
  }

  async submitAndListen<T>(tx: ICommand | IUnsignedCommand) {
    if (isSignedTransaction(tx)) {
      const request = await this.kdaClient.submit(tx);
      const response = await this.kdaClient.listen(request);
      return getCmdDataOrFail<T>(response);
    } else {
      throw new Error('Transaction must be signed');
    }
  }

  async runPact(code: string, data: Record<string, any> = {}) {
    const builder = this.execution(code);
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        builder.addData(key, value);
      }
    }
    return this.kdaClient.dirtyRead(builder.createTransaction());
  }

  async deployCode(
    code: string,
    {
      upgrade = false,
      preflight = false,
      init = false,
      namespace,
      keysets,
      data,
      signer = this.networkConfig.senderAccount,
      caps = [],
      skipSign = false,
      listen = true,
    }: DeployContractParams = {},
  ) {
    const txBuilder = this.execution(code).addData('upgrade', upgrade).addData('init', init);
    if (signer && !skipSign) {
      const signerKeys = this.getSigner(signer);
      if (!signerKeys) {
        throw new Error(`Signer ${signer} not found in network accounts`);
      }
      txBuilder.addSigner(signerKeys.publicKey, (signFor) =>
        caps.map((capArgs) => signFor.apply(null, capArgs as any)),
      );
    }

    if (namespace) {
      txBuilder.addData('namespace', namespace);
      txBuilder.addData('ns', namespace);
    }

    if (typeof keysets === 'object') {
      for (const [keysetName, keyset] of Object.entries(keysets)) {
        txBuilder.addKeyset(keysetName, keyset.pred, ...keyset.keys);
      }
    }

    if (data) {
      for (const [key, value] of Object.entries(data)) {
        txBuilder.addData(key, value as any);
      }
    }

    let tx = txBuilder.createTransaction();
    if (!skipSign) {
      tx = await this.sign(tx);
    }

    if (preflight) {
      const res = await this.preflight(tx);
      if (res.preflightWarnings) {
        console.warn('Preflight warnings:', res.preflightWarnings?.join('\n'));
      }
    }

    return listen ? this.submitAndListen(tx) : this.submit(tx);
  }

  describeModule(module: string) {
    return this.runPact(`(describe-module "${module}")`);
  }

  async isContractDeployed(module: string) {
    const res = await this.describeModule(module);
    if (res.result.status === 'success') {
      return true;
    }
    return false;
  }

  async deployContract(contract: string, params?: DeployContractParams) {
    const contractsDir = this.pactConfig.contractsDir;
    const contractPath = join(contractsDir, contract);
    const stats = await stat(contractPath);
    if (!stats.isFile()) {
      throw new Error(`Contract file not found: ${contractPath}`);
    }
    const contractCode = await readFile(contractPath, 'utf-8');
    return this.deployCode(contractCode, params);
  }
}