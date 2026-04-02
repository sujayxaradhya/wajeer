-- Better Auth Schema for SurrealDB
-- Run these queries in your SurrealDB instance

-- User table
DEFINE TABLE user TYPE ANY SCHEMALESS COMMENT 'better-auth: users' PERMISSIONS NONE;
DEFINE FIELD name ON user TYPE string PERMISSIONS FULL;
DEFINE FIELD email ON user TYPE string ASSERT string::is_email($value) PERMISSIONS FULL;
DEFINE FIELD email_verified ON user TYPE bool | none PERMISSIONS FULL;
DEFINE FIELD image ON user TYPE string | none PERMISSIONS FULL;
DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD updated_at ON user TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD password_hash ON user TYPE string | none PERMISSIONS FULL;
DEFINE FIELD roles ON user TYPE array<string> DEFAULT [] PERMISSIONS FULL;
DEFINE FIELD roles.* ON user TYPE string PERMISSIONS FULL;
DEFINE FIELD trust_score ON user TYPE float DEFAULT 4.5f PERMISSIONS FULL;

-- Account table (for OAuth providers and email/password)
DEFINE TABLE account TYPE ANY SCHEMALESS COMMENT 'better-auth: accounts' PERMISSIONS NONE;
DEFINE FIELD account_id ON account TYPE string PERMISSIONS FULL;
DEFINE FIELD provider_id ON account TYPE string PERMISSIONS FULL;
DEFINE FIELD user_id ON account TYPE string PERMISSIONS FULL;
DEFINE FIELD password ON account TYPE string | none PERMISSIONS FULL;
DEFINE FIELD access_token ON account TYPE string | none PERMISSIONS FULL;
DEFINE FIELD refresh_token ON account TYPE string | none PERMISSIONS FULL;
DEFINE FIELD id_token ON account TYPE string | none PERMISSIONS FULL;
DEFINE FIELD access_token_expires_at ON account TYPE datetime | none PERMISSIONS FULL;
DEFINE FIELD refresh_token_expires_at ON account TYPE datetime | none PERMISSIONS FULL;
DEFINE FIELD scope ON account TYPE string | none PERMISSIONS FULL;
DEFINE FIELD created_at ON account TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD updated_at ON account TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
DEFINE INDEX idx_account_provider ON account FIELDS provider_id, account_id;
DEFINE INDEX idx_account_user ON account FIELDS user_id;

-- Session table
DEFINE TABLE session TYPE ANY SCHEMALESS COMMENT 'better-auth: sessions' PERMISSIONS NONE;
DEFINE FIELD token ON session TYPE string PERMISSIONS FULL;
DEFINE FIELD user_id ON session TYPE string PERMISSIONS FULL;
DEFINE FIELD expires_at ON session TYPE datetime PERMISSIONS FULL;
DEFINE FIELD ip_address ON session TYPE string | none PERMISSIONS FULL;
DEFINE FIELD user_agent ON session TYPE string | none PERMISSIONS FULL;
DEFINE FIELD created_at ON session TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD updated_at ON session TYPE datetime DEFAULT time::now() PERMISSIONS FULL;

-- Verification table (for email verification, password reset, etc.)
DEFINE TABLE verification TYPE ANY SCHEMALESS COMMENT 'better-auth: verification' PERMISSIONS NONE;
DEFINE FIELD identifier ON verification TYPE string PERMISSIONS FULL;
DEFINE FIELD `value` ON verification TYPE string PERMISSIONS FULL;
DEFINE FIELD expires_at ON verification TYPE datetime PERMISSIONS FULL;
DEFINE FIELD created_at ON verification TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD updated_at ON verification TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
