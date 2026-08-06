CREATE TABLE activity_logs (
  slug TEXT NOT NULL,
  action TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (slug, action, ip_hash)
);
