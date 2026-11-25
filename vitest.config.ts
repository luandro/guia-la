import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

// Workspace test config: three inline projects sharing this root config
// (including the @/ alias from apps/app/tsconfig.json paths). The app
// project only picks up pure-logic tests (state, i18n, config, metadata);
// component tests arrive with Phase 05's testing package.
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "apps/app/src"),
    },
  },
  test: {
    projects: [
      {
        test: {
          name: "packages",
          include: ["packages/*/**/*.{test,spec}.ts"],
        },
      },
      {
        test: {
          name: "app",
          include: ["apps/app/src/**/*.{test,spec}.{ts,tsx}"],
        },
      },
      {
        test: {
          name: "tools",
          include: ["tools/**/*.{test,spec}.ts"],
        },
      },
    ],
  },
});
