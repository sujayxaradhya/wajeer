-- Wajeer MVP Schema for SurrealDB
-- Run this against your SurrealDB Cloud instance

-- ─────────────────────────────────────────────────────────────
-- USER TABLE
-- ─────────────────────────────────────────────────────────────
DEFINE TABLE user SCHEMAFULL PERMISSIONS FOR
    SELECT, CREATE, UPDATE WHERE id = $auth.id,
    FOR DELETE NONE
;

DEFINE FIELD email ON user TYPE string ASSERT string::is_email($value);
-- Better Auth sends boolean (false/true), not datetime
DEFINE FIELD email_verified ON user TYPE bool | none;
DEFINE FIELD name ON user TYPE string;
DEFINE FIELD image ON user TYPE string | none;
DEFINE FIELD password_hash ON user TYPE string | none;
DEFINE FIELD trust_score ON user TYPE float DEFAULT 4.5;
DEFINE FIELD roles ON user TYPE array<string> DEFAULT [];
DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON user TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_user_email ON user FIELDS email UNIQUE;

-- ─────────────────────────────────────────────────────────────
-- SESSION TABLE (Better Auth)
-- ─────────────────────────────────────────────────────────────
DEFINE TABLE session SCHEMAFULL PERMISSIONS FOR
    SELECT, CREATE, UPDATE WHERE user_id = $auth.id,
    FOR DELETE WHERE user_id = $auth.id
;

-- Better Auth passes plain string UUIDs, not SurrealDB record<user> references
DEFINE FIELD user_id ON session TYPE string;
DEFINE FIELD expires_at ON session TYPE datetime;
DEFINE FIELD token ON session TYPE string;
DEFINE FIELD ip_address ON session TYPE string | none;
DEFINE FIELD user_agent ON session TYPE string | none;
DEFINE FIELD created_at ON session TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON session TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_session_token ON session FIELDS token UNIQUE;
DEFINE INDEX idx_session_user ON session FIELDS user_id;

-- ─────────────────────────────────────────────────────────────
-- ACCOUNT TABLE (Better Auth - OAuth providers)
-- ─────────────────────────────────────────────────────────────
DEFINE TABLE account SCHEMAFULL PERMISSIONS FOR
    SELECT, CREATE WHERE user_id = $auth.id,
    FOR UPDATE, DELETE NONE
;

-- Better Auth passes plain string UUIDs, not SurrealDB record<user> references
DEFINE FIELD user_id ON account TYPE string;
DEFINE FIELD account_id ON account TYPE string;
DEFINE FIELD provider_id ON account TYPE string;
-- Better Auth stores bcrypt-hashed password here for credential provider
DEFINE FIELD password ON account TYPE string | none;
DEFINE FIELD access_token ON account TYPE string | none;
DEFINE FIELD refresh_token ON account TYPE string | none;
DEFINE FIELD access_token_expires_at ON account TYPE datetime | none;
DEFINE FIELD refresh_token_expires_at ON account TYPE datetime | none;
DEFINE FIELD scope ON account TYPE string | none;
DEFINE FIELD id_token ON account TYPE string | none;
DEFINE FIELD created_at ON account TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON account TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_account_user ON account FIELDS user_id;
DEFINE INDEX idx_account_provider ON account FIELDS provider_id, account_id;

-- ─────────────────────────────────────────────────────────────
-- VERIFICATION TABLE (Better Auth - email verification)
-- ─────────────────────────────────────────────────────────────
DEFINE TABLE verification SCHEMAFULL PERMISSIONS FOR
    SELECT, CREATE, UPDATE, DELETE NONE
;

DEFINE FIELD identifier ON verification TYPE string;
DEFINE FIELD value ON verification TYPE string;
DEFINE FIELD expires_at ON verification TYPE datetime;
DEFINE FIELD created_at ON verification TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON verification TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_verification_identifier ON verification FIELDS identifier;

-- ─────────────────────────────────────────────────────────────
-- BUSINESS TABLE
-- ─────────────────────────────────────────────────────────────
DEFINE TABLE business SCHEMAFULL PERMISSIONS FOR
    SELECT FULL,
    FOR CREATE, UPDATE WHERE owner_id = $auth.id,
    FOR DELETE NONE
;

DEFINE FIELD name ON business TYPE string;
DEFINE FIELD owner_id ON business TYPE record<user>;
DEFINE FIELD created_at ON business TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_business_owner ON business FIELDS owner_id;

-- ─────────────────────────────────────────────────────────────
-- LOCATION TABLE
-- ─────────────────────────────────────────────────────────────
DEFINE TABLE location SCHEMAFULL PERMISSIONS FOR
    SELECT FULL,
    FOR CREATE, UPDATE, DELETE WHERE business_id.owner_id = $auth.id
;

DEFINE FIELD business_id ON location TYPE record<business>;
DEFINE FIELD name ON location TYPE string;
DEFINE FIELD address ON location TYPE string;
DEFINE FIELD created_at ON location TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_location_business ON location FIELDS business_id;

-- ─────────────────────────────────────────────────────────────
-- USER_BUSINESS TABLE (team membership)
-- ─────────────────────────────────────────────────────────────
DEFINE TABLE user_business SCHEMAFULL PERMISSIONS FOR
    SELECT, CREATE, UPDATE, DELETE WHERE
        user_id = $auth.id OR business_id.owner_id = $auth.id
;

DEFINE FIELD user_id ON user_business TYPE record<user>;
DEFINE FIELD business_id ON user_business TYPE record<business>;
DEFINE FIELD location_id ON user_business TYPE record<location> | none;
DEFINE FIELD role ON user_business TYPE string ASSERT $value IN ['owner', 'manager', 'worker'];
DEFINE FIELD trust_score ON user_business TYPE float DEFAULT 4.5;
DEFINE FIELD reliability ON user_business TYPE float DEFAULT 0;
DEFINE FIELD invited_at ON user_business TYPE datetime DEFAULT time::now();
DEFINE FIELD joined_at ON user_business TYPE datetime;

DEFINE INDEX idx_user_business_user ON user_business FIELDS user_id;
DEFINE INDEX idx_user_business_business ON user_business FIELDS business_id;

-- ─────────────────────────────────────────────────────────────
-- SHIFT TABLE
-- ─────────────────────────────────────────────────────────────
DEFINE TABLE shift SCHEMAFULL PERMISSIONS FOR
    SELECT FULL,
    FOR CREATE, UPDATE WHERE location_id.business_id.owner_id = $auth.id OR
        id IN (SELECT VALUE shift_id FROM claim WHERE worker_id = $auth.id),
    FOR DELETE WHERE location_id.business_id.owner_id = $auth.id
;

DEFINE FIELD location_id ON shift TYPE record<location>;
DEFINE FIELD posted_by ON shift TYPE record<user>;
DEFINE FIELD role ON shift TYPE string;
DEFINE FIELD title ON shift TYPE string;
DEFINE FIELD date ON shift TYPE string;
DEFINE FIELD start_time ON shift TYPE string;
DEFINE FIELD end_time ON shift TYPE string;
DEFINE FIELD hourly_rate ON shift TYPE float | none;
DEFINE FIELD notes ON shift TYPE string | none;
DEFINE FIELD status ON shift TYPE string DEFAULT 'open' ASSERT $value IN ['open', 'claimed', 'approved', 'completed', 'cancelled'];
DEFINE FIELD created_at ON shift TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON shift TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_shift_location ON shift FIELDS location_id;
DEFINE INDEX idx_shift_status ON shift FIELDS status;
DEFINE INDEX idx_shift_role ON shift FIELDS role;

-- ─────────────────────────────────────────────────────────────
-- CLAIM TABLE
-- ─────────────────────────────────────────────────────────────
DEFINE TABLE claim SCHEMAFULL PERMISSIONS FOR
    SELECT FULL,
    FOR CREATE WHERE worker_id = $auth.id,
    FOR UPDATE WHERE shift_id.location_id.business_id.owner_id = $auth.id,
    FOR DELETE WHERE worker_id = $auth.id
;

DEFINE FIELD shift_id ON claim TYPE record<shift>;
DEFINE FIELD worker_id ON claim TYPE record<user>;
DEFINE FIELD status ON claim TYPE string DEFAULT 'pending' ASSERT $value IN ['pending', 'approved', 'rejected'];
DEFINE FIELD claimed_at ON claim TYPE datetime DEFAULT time::now();
DEFINE FIELD responded_at ON claim TYPE datetime | none;

DEFINE INDEX idx_claim_shift ON claim FIELDS shift_id;
DEFINE INDEX idx_claim_worker ON claim FIELDS worker_id;
DEFINE INDEX idx_claim_status ON claim FIELDS status;

-- ─────────────────────────────────────────────────────────────
-- NOTIFICATION TABLE
-- ─────────────────────────────────────────────────────────────
DEFINE TABLE notification SCHEMAFULL PERMISSIONS FOR
    SELECT, CREATE, UPDATE, DELETE WHERE user_id = $auth.id
;

DEFINE FIELD user_id ON notification TYPE record<user>;
DEFINE FIELD type ON notification TYPE string ASSERT $value IN ['shift_posted', 'claim_approved', 'claim_rejected'];
DEFINE FIELD title ON notification TYPE string;
DEFINE FIELD body ON notification TYPE string;
DEFINE FIELD data ON notification TYPE object;
DEFINE FIELD read ON notification TYPE bool DEFAULT false;
DEFINE FIELD created_at ON notification TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_notification_user ON notification FIELDS user_id;
DEFINE INDEX idx_notification_read ON notification FIELDS user_id, read;