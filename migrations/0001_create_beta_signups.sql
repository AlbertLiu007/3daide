CREATE TABLE IF NOT EXISTS beta_signups (
  email TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'unknown',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS beta_signups_created_at_idx
  ON beta_signups (created_at DESC);
