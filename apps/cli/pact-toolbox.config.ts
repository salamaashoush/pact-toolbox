import {
  createDevNetNetworkConfig,
  createLocalChainwebNetworkConfig,
  createLocalNetworkConfig,
  defineConfig,
} from '@pact-toolbox/config';

const onDemandImage = {
  image: 'kadena/devnet',
  tag: 'on-demand-minimal',
  name: 'devnet-on-demand',
};

const onDemandImageSalama = {
  image: 'salamaashoush/kdevnet',
  tag: 'on-demand',
  name: 'devnet-on-demand',
};
const minimalImage = {
  image: 'salamaashoush/kdevnet',
  tag: 'minimal',
  name: 'devnet-minimal',
};

export default defineConfig({
  defaultNetwork: 'local',
  networks: {
    local: createLocalNetworkConfig(),
    localChainweb: createLocalChainwebNetworkConfig(),
    devnet: createDevNetNetworkConfig({
      containerConfig: minimalImage,
    }),
    devnetOnDemand: createDevNetNetworkConfig({
      containerConfig: onDemandImageSalama,
      onDemandMining: true,
    }),
  },
});
