---
title: "A Note on SQLite for Small-Scale Production"
description: "When SQLite is the right choice and how to use it well."
pubDate: 2026-05-20
tags: ["sqlite", "databases"]
draft: false
---

SQLite gets dismissed as a toy database. That's wrong. For a surprising number of workloads, SQLite is not just acceptable — it's the best option.

## When SQLite Works

SQLite is ideal when:

- You have a single writer (or low write contention)
- Your data fits on a single disk
- You value simplicity over horizontal scale
- You want zero operational overhead

If you're building a small-to-medium application and you're reaching for Postgres "just in case", considerSQLite first. You can always migrate later.

## WAL Mode

The single most important setting is **WAL (Write-Ahead Logging)** mode:

```sql
PRAGMA journal_mode = WAL;
```

WAL allows concurrent readers while a write is in progress. Without WAL, a write lock blocks all readers. With WAL, you get much better concurrency.

Other useful pragmas:

```sql
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;
```

## Backup Strategy

Use the SQLite Online Backup API via the `.backup` command:

```bash
sqlite3 mydb.db ".backup mydb-backup.db"
```

This takes a consistent snapshot without locking out readers.

## Conclusion

Don't default to Postgres for everything. Choose the tool that fits the workload. SQLite is a legitimate choice for many production systems.