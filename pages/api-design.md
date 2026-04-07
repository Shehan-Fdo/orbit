---
title: REST API Design Guide
description: Best practices for designing clean REST APIs
---

# REST API Design Guide

## URL Structure

```
GET    /users           → list users
POST   /users           → create user
GET    /users/:id       → get user
PUT    /users/:id       → replace user
PATCH  /users/:id       → update user
DELETE /users/:id       → delete user
```

## Naming Conventions

- Use **nouns**, not verbs: `/users` not `/getUsers`
- Use **plural**: `/posts` not `/post`
- Use **kebab-case**: `/blog-posts` not `/blogPosts`
- Nest related resources: `/users/:id/posts`

## Response Format

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Shehan",
    "email": "sh@example.com"
  },
  "meta": {
    "page": 1,
    "total": 42
  }
}
```

## Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "field": "email"
  }
}
```

## Versioning

```
/api/v1/users
/api/v2/users
```

> Never break a public API without versioning first.
