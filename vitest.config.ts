import { defineConfig } from "vitest/config";

// Workspace test config: every package under packages/* runs its own project.
export default defineConfig({
  test: {
    projects: ["packages/*"],
  },
});
