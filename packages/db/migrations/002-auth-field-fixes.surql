-- Auth field fixes — apply to existing DB without dropping tables
-- These DEFINE FIELD statements are idempotent: re-running them updates the definition.

-- Fix: Better Auth sends boolean for emailVerified, not datetime
DEFINE FIELD email_verified ON user TYPE bool | none;

-- Fix: session.user_id — Better Auth sends plain string UUID, not record<user>
DEFINE FIELD user_id ON session TYPE string;

-- Fix: session missing ip_address and user_agent (Better Auth inserts these)
DEFINE FIELD ip_address ON session TYPE string | none;
DEFINE FIELD user_agent ON session TYPE string | none;

-- Fix: account.user_id — Better Auth sends plain string UUID, not record<user>
DEFINE FIELD user_id ON account TYPE string;

-- Fix: account missing password — Better Auth stores hashed password here for credential provider
DEFINE FIELD password ON account TYPE string | none;
