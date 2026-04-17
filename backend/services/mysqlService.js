const mysql = require("mysql2/promise");
const { logger } = require("../logger");

let pool;
let schemaReady = false;

const USER_MANAGEMENT_SCHEMA = [
  `
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      firebase_uid VARCHAR(128) NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NULL,
      display_name VARCHAR(160) NOT NULL,
      role ENUM('admin', 'employee', 'customer') NOT NULL DEFAULT 'customer',
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      password_hash VARCHAR(255) NULL,
      department VARCHAR(120) NULL,
      job_title VARCHAR(120) NULL,
      employee_id VARCHAR(64) NULL,
      join_date DATE NULL,
      avatar TEXT NULL,
      avatar_source VARCHAR(40) NULL,
      github VARCHAR(255) NULL,
      linkedin TEXT NULL,
      portfolio TEXT NULL,
      bio TEXT NULL,
      experience VARCHAR(120) NULL,
      skills_json LONGTEXT NULL,
      show_on_team TINYINT(1) NOT NULL DEFAULT 0,
      is_mentor TINYINT(1) NOT NULL DEFAULT 0,
      location VARCHAR(255) NULL,
      cv_file_name VARCHAR(255) NULL,
      cv_file_path TEXT NULL,
      cv_uploaded_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_email (email),
      UNIQUE KEY uq_users_phone (phone),
      UNIQUE KEY uq_users_firebase_uid (firebase_uid),
      UNIQUE KEY uq_users_employee_id (employee_id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS account_requests (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      request_uid VARCHAR(64) NOT NULL,
      name VARCHAR(160) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NULL,
      department VARCHAR(120) NULL,
      requested_role VARCHAR(120) NULL,
      system_role ENUM('admin', 'employee', 'customer') NOT NULL DEFAULT 'employee',
      reason TEXT NULL,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      linked_user_id BIGINT UNSIGNED NULL,
      merge_count INT UNSIGNED NOT NULL DEFAULT 0,
      approved_by_uid VARCHAR(128) NULL,
      approved_by_email VARCHAR(255) NULL,
      approved_at DATETIME NULL,
      rejected_by_uid VARCHAR(128) NULL,
      rejected_by_email VARCHAR(255) NULL,
      rejected_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_account_requests_request_uid (request_uid),
      KEY idx_account_requests_email (email),
      KEY idx_account_requests_phone (phone),
      KEY idx_account_requests_status (status),
      CONSTRAINT fk_account_requests_linked_user
        FOREIGN KEY (linked_user_id) REFERENCES users(id)
        ON DELETE SET NULL
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      purpose ENUM('activate_account', 'reset_password') NOT NULL DEFAULT 'reset_password',
      token_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      request_ip VARCHAR(64) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_password_reset_tokens_lookup (user_id, purpose, expires_at, used_at),
      CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS user_merge_audit (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      surviving_user_id BIGINT UNSIGNED NOT NULL,
      merged_user_id BIGINT UNSIGNED NOT NULL,
      merged_by_uid VARCHAR(128) NULL,
      merged_by_email VARCHAR(255) NULL,
      merge_reason TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_user_merge_audit_surviving (surviving_user_id),
      KEY idx_user_merge_audit_merged (merged_user_id)
    )
  `,
];

const parseMysqlUrl = (rawUrl = "") => {
  const value = String(rawUrl || "").trim();
  if (!value) return null;

  try {
    const parsed = new URL(value);
    const protocol = String(parsed.protocol || "").toLowerCase();
    if (protocol !== "mysql:" && protocol !== "mysql2:") {
      return null;
    }

    return {
      host: parsed.hostname || "",
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username || ""),
      password: decodeURIComponent(parsed.password || ""),
      database: decodeURIComponent((parsed.pathname || "").replace(/^\//, "")),
    };
  } catch {
    return null;
  }
};

const getMysqlConfig = () => {
  const host = process.env.MYSQL_HOST;
  const port = process.env.MYSQL_PORT;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;

  if (host && port && user && password && database) {
    return {
      host,
      port: Number(port),
      user,
      password,
      database,
    };
  }

  const urlConfig = parseMysqlUrl(process.env.MYSQL_URL || process.env.DATABASE_URL);
  if (urlConfig?.host && urlConfig?.user && urlConfig?.password && urlConfig?.database) {
    return urlConfig;
  }

  return null;
};

const hasMysqlConfig = () => Boolean(getMysqlConfig());

const getPool = () => {
  const mysqlConfig = getMysqlConfig();
  if (!mysqlConfig) {
    throw new Error(
      "MySQL configuration is missing. Set MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE, or set MYSQL_URL / DATABASE_URL."
    );
  }

  if (!pool) {
    pool = mysql.createPool({
      host: mysqlConfig.host,
      port: Number(mysqlConfig.port || 3306),
      user: mysqlConfig.user,
      password: mysqlConfig.password,
      database: mysqlConfig.database,
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
      queueLimit: 0,
      charset: "utf8mb4",
      namedPlaceholders: false,
    });
  }

  return pool;
};

const ensureUserManagementSchema = async () => {
  if (schemaReady) {
    return;
  }

  const activePool = getPool();
  for (const statement of USER_MANAGEMENT_SCHEMA) {
    await activePool.query(statement);
  }
  schemaReady = true;
};

const withTransaction = async (executor) => {
  await ensureUserManagementSchema();
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await executor(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const query = async (sql, params = [], connection = null) => {
  await ensureUserManagementSchema();
  const runner = connection || getPool();
  const [rows] = await runner.execute(sql, params);
  return rows;
};

if (!hasMysqlConfig()) {
  logger.warn(
    "MySQL configuration is not set. User-management APIs will remain unavailable until MYSQL_HOST/MYSQL_PORT/MYSQL_USER/MYSQL_PASSWORD/MYSQL_DATABASE or MYSQL_URL/DATABASE_URL is provided."
  );
}

module.exports = {
  getPool,
  hasMysqlConfig,
  ensureUserManagementSchema,
  withTransaction,
  query,
};
