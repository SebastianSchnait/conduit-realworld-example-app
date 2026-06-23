// Sets DB env vars before any module in this worker is loaded.
// Runs as a vitest setupFile, so it executes before each test file.
// Vitest sets NODE_ENV=test, so models/index.js uses TEST_DB_* config block.
process.env.JWT_KEY = process.env.JWT_KEY || "vitest-test-secret-key";
process.env.TEST_DB_USERNAME = process.env.TEST_DB_USERNAME || "sa";
process.env.TEST_DB_PASSWORD = process.env.TEST_DB_PASSWORD || "Conduit_Dev_2024!";
process.env.TEST_DB_NAME = process.env.TEST_DB_NAME || "conduit_development";
process.env.TEST_DB_HOSTNAME = process.env.TEST_DB_HOSTNAME || "localhost";
process.env.TEST_DB_DIALECT = process.env.TEST_DB_DIALECT || "mssql";
process.env.TEST_DB_LOGGING = process.env.TEST_DB_LOGGING || "false";
