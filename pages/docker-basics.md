---
title: Docker Basics
description: Essential Docker commands and concepts
---

# Docker Basics

## Core Concepts

- **Image** — a read-only template
- **Container** — a running instance of an image
- **Volume** — persistent storage
- **Network** — communication between containers

## Common Commands

```bash
# Pull and run
docker pull nginx
docker run -d -p 8080:80 nginx

# List
docker ps          # running containers
docker ps -a       # all containers
docker images      # all images

# Stop and remove
docker stop <id>
docker rm <id>
docker rmi <image>
```

## Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "main.js"]
```

## Docker Compose

```yaml
version: "3"
services:
  app:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
```

```bash
docker compose up -d
docker compose down
docker compose logs -f
```
