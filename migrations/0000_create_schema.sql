-- Single table schema for all post activity logs

CREATE TABLE IF NOT EXISTS activity_logs (
  slug TEXT NOT NULL,
  action TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (slug, action, ip_hash)
);
