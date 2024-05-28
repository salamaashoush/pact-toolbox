import type { ChainId, IKeyPair } from '@kadena/types';
import { loadConfig } from 'c12';
import { defaultConfig } from './defaults';

export interface KeysetConfig {
  keys: string[];
  pred: 'keys-all' | 'keys-any' | 'keys-2' | '=';
}

export interface GetRpcUrlParams {
  chainId?: string;
  networkId?: string;
}

export interface Signer extends IKeyPair {
  account: string | `k:${string}`;
}

export interface NetworkMeta {
  chainId: ChainId;
  gasLimit?: number;
  gasPrice?: number;
  ttl?: number;
}
export interface CommonNetworkConfig {
  networkId: string;
  rpcUrl: string;
  name?: string;
  senderAccount: string;
  signers: Signer[];
  keysets: Record<string, KeysetConfig>;
  meta?: NetworkMeta;
}
export interface DevNetMiningConfig {
  /**
   * Wait for this period, in seconds, after receiving a transaction and then mine blocks on the chain where the transaction was received. This period is used to batch transactions and avoid mining a block for each transaction. Increasing this period also makes mining more realistic compared to the public networks
   * @default 5.0
   */
  batchPeriod?: number;
  /**
   * The number of blocks to mine faster after transactions; This makes it quicker to get a transaction confirmed.
   * @default 5
   */
  confirmationCount?: number;
  /**
   * The period, in seconds, to wait after minting the confirmation blocks of transactions
   * @default 5.0
   */
  confirmationPeriod?: number;
  /**
   * Disable quick mining for confirming transactions. Note that if you want to mint the blocks containing transactions only and no further confirmations, don’t disable this option and use MINING_CONFIRMATION_COUNT=1 instead.
   * @default false
   */
  disableConfirmation?: boolean;
  /**
   * Disable periodic mining when the network is idle. Note that this is NOT RECOMMENDED for most cases, since in the absence of mining, the node’s current time will lag behind and transactions will not be accepted. Consider increasing MINING_IDLE_PERIOD instead.
   * @default false
   */
  disableIdle?: boolean;
  /**
   * The average time, in seconds, it takes to mine blocks and advance the block height by one while the network is idle (i.e. no incoming transactions)
   * @default 30.0
   */
  idlePeriod?: number;
}
export interface DevNetworkConfig extends CommonNetworkConfig, LocalNetworkCommonConfig {
  type: 'chainweb-devnet';
  containerConfig?: DevNetContainerConfig;
  miningConfig?: DevNetMiningConfig;
}

export interface ChainwebMiningClientConfig {
  publicKey: string;
  worker: 'constant-delay' | 'on-demand';
  stratumPort: number;
  constantDelayBlockTime: number;
  threadCount: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  noTls: boolean;
  onDemandPort: number;
}

export interface ChainwebNodeConfig {
  persistDb: boolean;
  configFile: string;
  p2pCertificateChainFile: string;
  p2pCertificateKeyFile: string;
  p2pHostname: string;
  p2pPort: number;
  bootstrapReachability: number;
  clusterId: string;
  p2pMaxSessionCount: number;
  mempoolP2pMaxSessionCount: number;
  knownPeerInfo: string;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  enableMiningCoordination: boolean;
  miningPublicKey: string;
  headerStream: boolean;
  rosetta: boolean;
  allowReadsInLocal: boolean;
  databaseDirectory: string;
  disablePow: boolean;
  servicePort: number;
}

export interface LocalNetworkCommonConfig {
  autoStart?: boolean;
}

export interface LocalChainwebNetworkConfig extends CommonNetworkConfig, LocalNetworkCommonConfig {
  type: 'chainweb-local';
  miningClientConfig?: ChainwebMiningClientConfig;
  nodeConfig?: ChainwebNodeConfig;
}

export interface PactServerNetworkConfig extends CommonNetworkConfig, LocalNetworkCommonConfig {
  type: 'pact-server';
  serverConfig?: PactServerConfig;
}

export interface ChainwebNetworkConfig extends CommonNetworkConfig {
  type: 'chainweb';
}

export type NetworkConfig =
  | DevNetworkConfig
  | PactServerNetworkConfig
  | ChainwebNetworkConfig
  | LocalChainwebNetworkConfig;
export type NetwokConfigType = NetworkConfig['type'];

export type PactExecConfigFlags =
  | 'AllowReadInLocal'
  | 'DisableHistoryInTransactionalMode'
  | 'DisableInlineMemCheck'
  | 'DisableModuleInstall'
  | 'DisableNewTrans'
  | 'DisablePact40'
  | 'DisablePact420'
  | 'DisablePact43'
  | 'DisablePact431'
  | 'DisablePact44'
  | 'DisablePact45'
  | 'DisablePact46'
  | 'DisablePact47'
  | 'DisablePact48'
  | 'DisablePact49'
  | 'DisablePactEvents'
  | 'DisableRuntimeReturnTypeChecking'
  | 'EnforceKeyFormats'
  | 'OldReadOnlyBehavior'
  | 'PreserveModuleIfacesBug'
  | 'PreserveModuleNameBug'
  | 'PreserveNsModuleInstallBug'
  | 'PreserveShowDefs';
export interface PactServerConfig {
  /**
   * HTTP server port
   */
  port?: string | number;
  /**
   * Directory for HTTP logs
   */
  logDir?: string;
  /**
   * Directory for database files. If omitted, runs in-memory only.
   */
  persistDir?: string;
  /**
   * SQLite pragmas to use with persistence DBs
   */
  pragmas?: string[];
  /**
   * verbosity of logging
   */
  verbose?: boolean;
  /**
   * Entity name for simulating privacy, defaults to "entity"
   */
  entity?: string;

  /**
   * Pact runtime execution flags
   */
  execConfig?: (PactExecConfigFlags | (string & {}))[];
  /**
   * Gas limit for each transaction, defaults to 0
   */
  gasLimit?: number;
  /**
   * Gas price per action, defaults to 0
   */
  gasRate?: number;
}

export interface DevNetContainerConfig {
  port?: string | number;
  volume?: string;
  name?: string;
  image: string;
  tag?: string;
}

export type StandardPrelude = 'kadena/chainweb' | 'kadena/marmalade';
export interface PactToolboxConfigEnvOverrides<
  T extends Record<string, NetworkConfig> = Record<string, NetworkConfig>,
> {
  extends?: string | string[];
  // environment specific configurations
  $test?: Partial<PactToolboxConfigObj<T>>;
  $development?: Partial<PactToolboxConfigObj<T>>;
  $production?: Partial<PactToolboxConfigObj<T>>;
  $env?: { [key: string]: Partial<PactToolboxConfigObj<T>> };
}
export interface PactToolboxConfigObj<T extends Record<string, NetworkConfig> = Record<string, NetworkConfig>> {
  defaultNetwork: keyof T;
  networks: T;
  contractsDir?: string;
  scriptsDir?: string;
  pactVersion?: string;
  preludes?: StandardPrelude[];
  downloadPreludes?: boolean;
  deployPreludes?: boolean;
  devProxyPort?: string | number;
  enableDevProxy?: boolean;
}

export type PactToolboxConfig<T extends Record<string, NetworkConfig> = {}> =
  | (Partial<PactToolboxConfigObj<T>> & PactToolboxConfigEnvOverrides<T>)
  | ((network: string) => Partial<PactToolboxConfigObj<T>> & PactToolboxConfigEnvOverrides<T>);

export async function resolveConfig(overrides?: Partial<PactToolboxConfigObj>) {
  const configResult = await loadConfig<PactToolboxConfigObj>({
    name: 'pact-toolbox',
    overrides: overrides as PactToolboxConfigObj,
    defaultConfig: defaultConfig as PactToolboxConfigObj,
  });
  return configResult.config as Required<PactToolboxConfigObj>;
}

export function defineConfig<T extends Record<string, NetworkConfig> = Record<string, NetworkConfig>>(
  config: PactToolboxConfig<T>,
) {
  return config;
}
