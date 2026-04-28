CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'user'))
);

ALTER TABLE users
    ADD COLUMN subscription_plan    VARCHAR(32)  NOT NULL DEFAULT 'free', -- 'free' | 'starter' | 'pro' | 'enterprise'
    ADD COLUMN subscription_expires TIMESTAMPTZ; 

CREATE INDEX idx_users_email ON users(email)