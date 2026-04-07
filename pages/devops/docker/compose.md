---
title: Docker Compose
description: Orchestrating multi-container apps with Docker Compose
---

# Docker Compose

Docker Compose lets you define and run multi-container applications.

## Basic compose.yml

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
    volumes:
      - .:/app

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## Commands

```bash
docker compose up -d        # start in background
docker compose down         # stop and remove containers
docker compose logs -f app  # follow logs
docker compose exec app sh  # shell into container
docker compose build        # rebuild images
docker compose ps           # status
```

## Health Checks

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```
