# Pact toolbox super quick start guide

This guide will help you to get started with the Pact toolbox in a few minutes.

## Create a new project

### Step 1: Create a vite project (typescript is recommended)

```bash
npm create vite@latest hello-world-dapp -- --template react-swc-ts
```

### Step 2: Initialize a Pact toolbox project

```bash
npx pact-toolbox init
```

### Step 3: Update `vite.config.ts`

```typescript
// NOTE: don't override the existing file, just update the necessary parts.
// import pact vite plugin
import pactVitePlugin from '@pact-toolbox/unplugin/vite';

export default defineConfig({
  plugins: [
    // add pact vite plugin
    pactVitePlugin({
      onReady: async (client) => {
        const isDeployed = await client.isContractDeployed('free.todos');
        await client.deployContract('todos.pact', {
          prepareTx: {
            upgrade: isDeployed,
          },
        });
      },
    }),
  ],
});
```

### Step 4: Make sure you have pact installed

- to check your system

```bash
npx pact-toolbox doctor
```

- to install pact

```bash
npx pact-toolbox pact install 4.10
```

### Step 5: Start vite dev server

```bash
npm run dev
```

## Project structure

```
hello-world-dapp
├── pact // pact files
│   ├── hello-world.pact // pact smart contract
│   └── hello-world.repl // pact repl file
├── scripts
│   ├── deploy.dev.ts // deploy script
│   ├── deploy.prod.ts // deploy script
├── src
│   ├── api.ts // @kadena/client api calls
├── pact-toolbox.config.ts // pact toolbox config file
```

## Next steps

- [Read the full documentation](https://pact-toolbox.github.io/docs)
