const mssqlOptions =
  process.env.DEV_DB_DIALECT === "mssql" ||
  process.env.TEST_DB_DIALECT === "mssql" ||
  process.env.PROD_DB_DIALECT === "mssql"
    ? { dialectOptions: { options: { trustServerCertificate: true, encrypt: true } } }
    : {};

/** @type {import('sequelize').Options} */
module.exports = {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOSTNAME,
    dialect: process.env.DEV_DB_DIALECT,
    logging: process.env.DEV_DB_LOGGING === "true",
    ...(process.env.DEV_DB_DIALECT === "mssql" && mssqlOptions),
  },
  test: {
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    host: process.env.TEST_DB_HOSTNAME,
    dialect: process.env.TEST_DB_DIALECT,
    logging: process.env.TEST_DB_LOGGING === "true",
    ...(process.env.TEST_DB_DIALECT === "mssql" && mssqlOptions),
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    dialect: process.env.PROD_DB_DIALECT,
    logging: process.env.PROD_DB_LOGGING === "true",
    ...(process.env.PROD_DB_DIALECT === "mssql" && mssqlOptions),
  },
};
