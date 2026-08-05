-- Clean 2-table schema for post stats and upvote activity logs

CREATE TABLE IF NOT EXISTS post_stats (
  slug TEXT PRIMARY KEY,
  upvotes INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS activity_logs (
  slug TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (slug, ip_hash)
);
