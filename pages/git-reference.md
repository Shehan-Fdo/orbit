---
title: Git Reference
description: Everyday Git commands and workflows
---

# Git Reference

## Setup

```bash
git config --global user.name "Shehan"
git config --global user.email "shehan@example.com"
```

## Daily Workflow

```bash
git status
git add .
git commit -m "feat: add new feature"
git push origin main
```

## Branching

```bash
git checkout -b feature/my-feature
git merge feature/my-feature
git branch -d feature/my-feature
```

## Undoing Things

| Situation | Command |
|-----------|---------|
| Undo last commit (keep changes) | `git reset --soft HEAD~1` |
| Discard all local changes | `git checkout .` |
| Remove untracked files | `git clean -fd` |
| Revert a pushed commit | `git revert <hash>` |

## Useful Aliases

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.lg "log --oneline --graph --all"
```

> ~~Never~~ **Always** write meaningful commit messages.
