// Flat ESLint config: eslint-config-expo for apps/app, typescript-eslint for
// packages and root scripts (Phase 02, task 02-5).
import { defineConfig, globalIgnores } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "**/node_modules/",
    "**/dist/",
    "**/coverage/",
    "**/.expo/",
    "**/example/",
    ".worktrees/",
    "apps/app/assets/",
    "apps/app/scripts/reset-project.js",
    "apps/app/.rnstorybook/storybook.requires.ts",
  ]),
  {
    files: ["apps/app/**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    extends: [expoConfig],
    settings: {
      // Resolve the app's `@/*` tsconfig path alias for import/no-unresolved
      // (the app tsconfig owns the alias mapping).
      "import/resolver": {
        typescript: {
          project: ["apps/app/tsconfig.json"],
        },
      },
    },
  },
  {
    files: [
      "packages/**/*.{js,jsx,mjs,cjs,ts,tsx}",
      "apps/storybook/**/*.{js,jsx,mjs,cjs,ts,tsx}",
      "tools/**/*.{js,mjs,cjs,ts}",
      "*.{js,mjs,cjs,ts}",
      "scripts/**/*.{js,mjs,cjs,ts}",
    ],
    extends: [tseslint.configs.recommended],
  },
);
