CREATE TABLE IF NOT EXISTS families (
  family_id TEXT PRIMARY KEY,
  password_hash TEXT,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
