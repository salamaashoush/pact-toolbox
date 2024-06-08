/// <reference types="vitest" />
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

import pactVitePlugin from "@pact-toolbox/unplugin/vite";

export default defineConfig({
  plugins: [
    react(),
    pactVitePlugin({
      onReady: async (client) => {
        const isDeployed = await client.isContractDeployed("free.todos");
        await client.deployContract("todos.pact", {
          prepareTx: {
            upgrade: isDeployed,
          },
        });
      },
    }),
  ],
  test: {
    environment: "happy-dom",
    testTimeout: 1000000,
    hookTimeout: 1000000,
    setupFiles: ["vitest.setup.ts"],
  },
});
