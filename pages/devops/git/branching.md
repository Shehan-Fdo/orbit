---
title: Git Branching Strategy
description: How to manage branches effectively
---

# Git Branching Strategy

## Branch Types

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `release/*` | Release preparation |

## Feature Branch Workflow

```bash
# Start a feature
git checkout develop
git pull
git checkout -b feature/user-auth

# Work, commit...
git add .
git commit -m "feat: add JWT authentication"

# Push and open PR
git push origin feature/user-auth
```

## Keeping Branch Updated

```bash
git fetch origin
git rebase origin/develop
# or
git merge origin/develop
```

## Cleaning Up

```bash
git branch -d feature/user-auth             # delete local
git push origin --delete feature/user-auth  # delete remote
git remote prune origin                     # clean stale refs
```
