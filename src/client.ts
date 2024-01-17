import {
  IClient,
  ICommand,
  IKeyPair,
  IUnsignedCommand,
  Pact,
  createClient,
  createSignWithKeypair,
  isSignedTransaction,
} from '@kadena/client';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { KeysetConfig, NetworkConfig, PactConfig, PactToolboxConfigObj } from './config';
import { defaultMeta, defaultNetworks } from './defaults';
import { getCmdDataOrFail } from './utils';

export interface DeployContractParams {
  upgrade?: boolean;
  preflight?: boolean;
  init?: boolean;
  namespace?: string;
  keysets?: Record<string, KeysetConfig>;
  signer?: string;
  data?: Record<string, unknown>;
  caps?: string[][];
  skipSign?: boolean;
}

export class PactToolboxClient {
  private kdaClient: IClient;
  private networkConfig: NetworkConfig;
  private pactConfig: Required<PactConfig>;

  constructor(private config: Required<PactToolboxConfigObj>) {
    const networkName = config.defaultNetwork || 'local';
    const networkConfig = config.networks[networkName] ?? defaultNetworks[networkName] ?? {};
    this.networkConfig = {
      ...networkConfig,
      name: networkName,
    } as NetworkConfig;
    this.pactConfig = config.pact as Required<PactConfig>;
    this.kdaClient = createClient((args) =>
      typeof this.networkConfig.rpcUrl === 'string' ? this.networkConfig.rpcUrl : this.networkConfig.rpcUrl(args),
    );
  }

  get network() {
    return this.networkConfig;
  }

  getConfig() {
    return this.config;
  }

  getSigner(address: string = this.networkConfig.senderAccount) {
    const s = this.networkConfig.signers.find((s) => s.address === address);
    if (!s) {
      throw new Error(`Signer ${address} not found in network accounts`);
    }
    return s;
  }

  execution(command: string) {
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
      .setNetworkId(this.networkConfig.networkId);
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

  async local<T>(tx: IUnsignedCommand | ICommand) {
    const res = await this.kdaClient.local(tx);
    return getCmdDataOrFail<T>(res);
  }

  async preflight(tx: IUnsignedCommand | ICommand) {
    return this.kdaClient.preflight(tx);
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

    return this.submitAndListen(tx);
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
