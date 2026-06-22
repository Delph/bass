import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const appPath = fileURLToPath(new URL("./app", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "~": appPath,
      "@": appPath,
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
