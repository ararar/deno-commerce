-- Migration: auth_users
-- Created at: 2020-07-22 13:47:54
-- ====  UP  ====

BEGIN;
CREATE TABLE IF NOT EXISTS auth_users (
  ID BIGINT(20),
  user_login VARCHAR(50),
  user_pass VARCHAR(255),
  user_email VARCHAR(100),
  user_registered DATETIME,
  user_activation_key VARCHAR(255),
  display_name VARCHAR(50),
);
COMMIT;

-- ==== DOWN ====

BEGIN;
DROP TABLE IF EXISTS auth_users;
COMMIT;
