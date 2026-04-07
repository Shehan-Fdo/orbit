---
title: SQL Cheatsheet
description: Essential SQL queries and patterns
---

# SQL Cheatsheet

## Basic Queries

```sql
SELECT * FROM users;
SELECT name, email FROM users WHERE active = true;
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
```

## Joins

```sql
-- Inner join
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id;

-- Left join
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id;
```

## Insert, Update, Delete

```sql
INSERT INTO users (name, email) VALUES ('Shehan', 'sh@example.com');
UPDATE users SET active = false WHERE last_login < '2024-01-01';
DELETE FROM users WHERE id = 42;
```

## Useful Functions

```sql
COUNT(*), SUM(amount), AVG(price), MAX(score), MIN(score)
COALESCE(value, 'default')
DATE_TRUNC('month', created_at)
LOWER(email), UPPER(name), TRIM(text)
```

## Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);
```
