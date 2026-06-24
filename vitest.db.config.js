import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["backend/tests/setup/setEnv.js"],
    include: ["backend/tests/integration/db.integration.test.js"],
    env: {
      JWT_KEY: "vitest-test-secret-key",
      TEST_DB_USERNAME: "sa",
      TEST_DB_PASSWORD: "Conduit_Dev_2024!",
      TEST_DB_NAME: "conduit_development",
      TEST_DB_HOSTNAME: "localhost",
      TEST_DB_DIALECT: "mssql",
      TEST_DB_LOGGING: "false",
    },
  },
});
