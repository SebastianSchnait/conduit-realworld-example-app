import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [
      "backend/tests/setup/setEnv.js",
      "frontend/src/setupTests.js",
    ],
    css: true,
    environmentMatchGlobs: [
      ["backend/**", "node"],
    ],
    exclude: [
      "tests/e2e/**",
      "node_modules/**",
    ],
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
