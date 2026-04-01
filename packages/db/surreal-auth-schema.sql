-- Better Auth Schema for SurrealDB
-- Run these queries in your SurrealDB instance

-- User table
DEFINE TABLE user TYPE ANY SCHEMALESS COMMENT 'better-auth: users' PERMISSIONS NONE;
DEFINE FIELD id ON user TYPE string PERMISSIONS FULL;
DEFINE FIELD name ON user TYPE string PERMISSIONS FULL;
DEFINE FIELD email ON user TYPE string PERMISSIONS FULL;
DEFINE FIELD email_verified ON user TYPE option<datetime> PERMISSIONS FULL;
DEFINE FIELD image ON user TYPE option<string> PERMISSIONS FULL;
DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD updated_at ON user TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD password_hash ON user TYPE option<string> PERMISSIONS FULL;
DEFINE FIELD roles ON user TYPE array<string> DEFAULT ['worker'] PERMISSIONS FULL;
DEFINE FIELD trust_score ON user TYPE number DEFAULT 0 PERMISSIONS FULL;

-- Account table (for OAuth providers and email/password)
DEFINE TABLE account TYPE ANY SCHEMALESS COMMENT 'better-auth: accounts' PERMISSIONS NONE;
DEFINE FIELD id ON account TYPE string PERMISSIONS FULL;
DEFINE FIELD account_id ON account TYPE string PERMISSIONS FULL;
DEFINE FIELD provider_id ON account TYPE string PERMISSIONS FULL;
DEFINE FIELD user_id ON account TYPE record<user> REFERENCE ON DELETE CASCADE PERMISSIONS FULL;
DEFINE FIELD password ON account TYPE option<string> PERMISSIONS FULL;
DEFINE FIELD access_token ON account TYPE option<string> PERMISSIONS FULL;
DEFINE FIELD refresh_token ON account TYPE option<string> PERMISSIONS FULL;
DEFINE FIELD id_token ON account TYPE option<string> PERMISSIONS FULL;
DEFINE FIELD access_token_expires_at ON account TYPE option<datetime> PERMISSIONS FULL;
DEFINE FIELD refresh_token_expires_at ON account TYPE option<datetime> PERMISSIONS FULL;
DEFINE FIELD scope ON account TYPE option<string> PERMISSIONS FULL;
DEFINE FIELD created_at ON account TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD updated_at ON account TYPE datetime DEFAULT time::now() PERMISSIONS FULL;

-- Session table
DEFINE TABLE session TYPE ANY SCHEMALESS COMMENT 'better-auth: sessions' PERMISSIONS NONE;
DEFINE FIELD id ON session TYPE string PERMISSIONS FULL;
DEFINE FIELD token ON session TYPE string PERMISSIONS FULL;
DEFINE FIELD user_id ON session TYPE record<user> REFERENCE ON DELETE CASCADE PERMISSIONS FULL;
DEFINE FIELD expires_at ON session TYPE datetime PERMISSIONS FULL;
DEFINE FIELD ip_address ON session TYPE option<string> PERMISSIONS FULL;
DEFINE FIELD user_agent ON session TYPE option<string> PERMISSIONS FULL;
DEFINE FIELD created_at ON session TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD updated_at ON session TYPE datetime DEFAULT time::now() PERMISSIONS FULL;

-- Verification table (for email verification, password reset, etc.)
DEFINE TABLE verification TYPE ANY SCHEMALESS COMMENT 'better-auth: verification' PERMISSIONS NONE;
DEFINE FIELD id ON verification TYPE string PERMISSIONS FULL;
DEFINE FIELD identifier ON verification TYPE string PERMISSIONS FULL;
DEFINE FIELD value ON verification TYPE string PERMISSIONS FULL;
DEFINE FIELD expires_at ON verification TYPE datetime PERMISSIONS FULL;
DEFINE FIELD created_at ON verification TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
DEFINE FIELD updated_at ON verification TYPE datetime DEFAULT time::now() PERMISSIONS FULL;
