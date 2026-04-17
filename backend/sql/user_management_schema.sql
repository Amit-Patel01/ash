-- SolutionHub user management schema (MySQL 8+)
-- Applied automatically at runtime via backend/services/mysqlService.js when tables are missing.
-- Use this file for manual provisioning or DBA review.

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
);

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
);

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
);

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
);
