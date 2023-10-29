import { resolve } from "node:path";

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "./lib/**/*"],
  },
  resolve: {
    alias: {
      "~": resolve("src"),
    },
  },
});
