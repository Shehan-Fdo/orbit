---
title: PostgreSQL Quick Reference
description: Essential PostgreSQL commands and patterns
---

# PostgreSQL Quick Reference

## Connect

```bash
psql -U postgres -d mydb
psql "postgresql://user:pass@localhost:5432/mydb"
```

## psql Commands

```
\l          list databases
\c mydb     connect to database
\dt         list tables
\d users    describe table
\q          quit
```

## Common Queries

```sql
-- Create table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert
INSERT INTO posts (title, body) VALUES ('Hello', 'World');

-- Query with filter
SELECT * FROM posts WHERE created_at > NOW() - INTERVAL '7 days';

-- Pagination
SELECT * FROM posts ORDER BY created_at DESC LIMIT 10 OFFSET 20;
```

## JSON Support

```sql
-- Store JSON
ALTER TABLE users ADD COLUMN meta JSONB;

-- Query JSON field
SELECT * FROM users WHERE meta->>'role' = 'admin';
SELECT meta->'settings'->>'theme' FROM users;
```
