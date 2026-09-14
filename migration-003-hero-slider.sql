CREATE TABLE IF NOT EXISTS hero_slides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eyebrow TEXT NOT NULL DEFAULT 'Trusted real estate guidance in Ghana',
  headline TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  primary_label TEXT NOT NULL DEFAULT 'Explore properties',
  primary_url TEXT NOT NULL DEFAULT '#properties',
  secondary_label TEXT,
  secondary_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_hero_status_position ON hero_slides(status, position);
