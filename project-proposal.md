# Pact Toolbox Project

## Objective

- **What is it?**  
  The Pact Toolbox Project comprises a comprehensive suite of tools and packages designed to enhance the development experience of decentralized applications (DApps), particularly for those transitioning from Web2 backgrounds and the Ethereum ecosystem.

- **Why is it needed?**  
  Recognizing the initial challenges faced by developers, especially those with web/frontend expertise accustomed to a plethora of tools facilitating development, this project aims to simplify the onboarding process within Kadena's ecosystem.

  Despite the sophistication of the technology, which reveals its strengths over time, first impressions are pivotal. The ease with which developers can start projects and achieve functional outcomes is often the benchmark for evaluation. This project's primary goal is to streamline the initiation phase, making it more accessible and appealing, particularly for developers familiar with Ethereum's tools, such as Hardhat.

  Kadena possesses all the necessary components to create a unified tool similar to Hardhat, yet these are currently not integrated under a single configuration. This project introduces a streamlined approach, offering a central configuration file accompanied by a suite of tools designed to work seamlessly with it, eliminating the need for developers to create their own tools or scripts.

  By integrating JavaScript and TypeScript, alongside UI components into a unified development workflow, the Pact Toolbox Project simplifies the process of creating, testing, and deploying DApps.

- **Who is it for?**  
  The project targets developers new to blockchain or those coming from other ecosystems like Ethereum, focusing on those with a background in JavaScript, TypeScript, and web/frontend development.

## Deliverables

- **Products/Tools:**  
  The Pact Toolbox Project will deliver a range tools/packages, including command-line tools (`@pact-toolbox/cli`), npm packages for various development needs, integration with popular wallets, and ready-to-use templates for common dApp patterns.

- **Documentation:**  
  Comprehensive documentation will be provided, covering installation, configuration, usage of tools and packages, best practices, and examples to ensure a smooth developer experience.

## Marketing Strategy

<!-- NOTE I dent fully understand what I need to write here but chatgpt helped with these :D  -->
### Target Audience Identification

- Primary Audience: Developers with experience in Web2 and Ethereum ecosystem looking to transition into developing DApps on Kadena.
- Secondary Audience: Existing Kadena ecosystem developers seeking to streamline their development process.

### Unique Value Proposition (UVP)

- Simplifies the transition for Web2 and Ethereum developers into the Kadena ecosystem.
- Offers a comprehensive suite of tools for streamlined DApp development, testing, and deployment.
- Enhances productivity and reduces the initial learning curve.

## Features and Milestones

### List of Features

- **Network Management Tools** (`@pact-toolbox/network`): Facilitate the starting and managing of various Kadena local networks (Pact server, Devnet, etc.). (test, document)
- **Frontend Build System Integration** (`@pact-toolbox/unplugin`): Bundler plugins to inject network configs and enables direct import of Pact files into frontend applications, streamlining smart contract interaction. (fix, test, document)
- **Development Proxy Server** (`@pact-toolbox/proxy`): Provide development dev server api to debugs and manage running networks (repurpose).
- **DApp Testing Utilities** (`@pact-toolbox/test`): Prepare a pact testing env for testing code that interacts with local networks  (test, document).
- **Web/Browser Utilities** (`@pact-toolbox/client-utils`): Enhances integration with the `@kadena/client` and `@kadena/client-utils`  (wip, test, document).
- **Node Runtime Utilities** (`@pact-toolbox/runtime`): General utils to interact with networks, eg deployment, simulations, etc (test, document).
- **Script Runner** (`@pact-toolbox/script`): Simplifies contract deployment and simulations through JS/TS scripts (test, document).
- **Standard Contract Management** (`@pact-toolbox/prelude`): Streamlines the downloading and deployment of standard Kadena contracts  (test, document).
- **Wallet Integration and Mocks** (`@pact-toolbox/wallet`): Provide unified wallet APIs and mocks(proxy to toolbox signing in tests) (eckoWallet, metamask, spireKey, etc). (wip, test, document)
- **Pact Installer** (`@pact-toolbox/installer`): Eases the installation and upgrade of Pact across different systems  (test, document).
- **CLI Tools** (`@pact-toolbox/cli`): A comprehensive CLI for project initialization, Pact management, and network operation ,eventually will be part of kadena-cli (test, document) (test, document).
- **Application Templates/Components**: Offers ready-to-use templates for common application patterns, including NFTs, gas stations, fungible tokens, and more. (n/a)
  - `pact-toolbox generate gas-station`
  - `pact-toolbox generate fungible-token`
  - `pact-toolbox generate nft`
- **Devtools UI** InApp devtools to help you debug transactions and manage networks from your app ui during development (similar to react-query devtools) (n/a).
  
### First Milestone

- Development of:
  - `@pact-toolbox/cli`
  - `@pact-toolbox/network`
  - `@pact-toolbox/proxy`
  - `@pact-toolbox/unplugin` maybe with direct import for pact files.
  - `@pact-toolbox/client-utils`
  - `@pact-toolbox/runtime`
  - `@pact-toolbox/script`
  - `@pact-toolbox/wallet` staring with ecko wallet only.
  - `@pact-toolbox/installer`
- Test coverage and Code docs.
- Initial documentation covering setup, configuration, and basic usage.
- Internal release and testing.

### Second Milestone

- Improve existing features after feedback from first milestone.
- Expansion of the toolkit to include
  - more testing frameworks and build tools integrations.
  - more Node runtime utilities.
  - more Wallet integrations/mocks.
  - more app templates.
- InApp devtools UI (Similar to React Query devtools) to interact with dev proxy and debug some pact cmds directly from UI.

## Timeline for v1 Release

Most of the mentioned packages already in WIP state and almost complete, but I still need lots of testing and refactoring here and there to make sure everything works smoothly.

<!-- This is an example, depending of the time and process could be different still need to check -->
The targeted timeline for the v1 release of the Pact Toolbox Project is Q2 2024. This will include the completion of the first milestone, with ongoing development towards the second milestone and continuous updates based on community feedback and evolving development needs.
