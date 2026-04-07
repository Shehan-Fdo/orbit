---
title: Getting Started with Linux
description: A beginner's guide to Linux basics
---

# Getting Started with Linux

Linux is an open-source operating system kernel first released by **Linus Torvalds** in 1991.

## Why Linux?

- Free and open source
- Highly customizable
- Secure and stable
- Runs on almost any hardware

## Basic Commands

| Command | Description |
|---------|-------------|
| `ls` | List directory contents |
| `cd` | Change directory |
| `pwd` | Print working directory |
| `mkdir` | Create a new directory |
| `rm` | Remove files or directories |

## Your First Script

```bash
#!/bin/bash
echo "Hello, World!"
echo "Current user: $USER"
echo "Current dir: $(pwd)"
```

> **Tip:** Always check `man <command>` for detailed documentation on any command.

## File Permissions

Linux uses a permission system with three levels:

1. **Owner** — the user who created the file
2. **Group** — users in the same group
3. **Others** — everyone else

```bash
chmod 755 script.sh
chown shehan:shehan file.txt
```
