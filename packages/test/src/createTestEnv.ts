import type { PactToolboxConfigObj } from '@pact-toolbox/config';
import { getNetworkConfig, resolveConfig } from '@pact-toolbox/config';
import { PactToolboxNetwork } from '@pact-toolbox/network';
import { PactToolboxClient } from '@pact-toolbox/runtime';
import { logger } from '@pact-toolbox/utils';
import { disablePersistence, injectNetworkConfig, updatePorts } from './utils';

export interface PactTestEnv {
  client: PactToolboxClient;
  stop: () => Promise<void>;
  start: () => Promise<void>;
  restart: () => Promise<void>;
  config: PactToolboxConfigObj;
}

export interface CreatePactTestEnvOptions {
  network?: string;
  client?: PactToolboxClient;
  configOverrides?: Partial<PactToolboxConfigObj>;
  config?: Required<PactToolboxConfigObj>;
  noPersistence?: boolean;
  enableProxy?: boolean;
}
export async function createPactTestEnv({
  network,
  noPersistence = true,
  client,
  config,
  configOverrides,
}: CreatePactTestEnvOptions = {}): Promise<PactTestEnv> {
  logger.pauseLogs();
  if (!config) {
    config = await resolveConfig(configOverrides);
  }

  if (network) {
    config.defaultNetwork = network;
  }
  const networkConfig = getNetworkConfig(config);
  await updatePorts(config);
  injectNetworkConfig(config);

  if (!client) {
    client = new PactToolboxClient(config);
  }

  if (noPersistence) {
    if (network) {
      disablePersistence(networkConfig);
    }
  }

  const localNetwork = new PactToolboxNetwork(config, {
    client,
    silent: true,
    logAccounts: false,
    isStateless: true,
  });
  return {
    start: async () => localNetwork.start(),
    stop: async () => localNetwork.stop(),
    restart: async () => localNetwork.restart(),
    client,
    config,
  };
}
