import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    testTimeout: 15000,
    // Run tests in a single process so they don't trample the shared SQLite file.
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
