---
title: Terminal Shortcuts
description: Essential terminal and shell shortcuts
---

# Terminal Shortcuts

## Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl+A` | Move to start of line |
| `Ctrl+E` | Move to end of line |
| `Ctrl+←` | Move word left |
| `Ctrl+→` | Move word right |
| `Ctrl+R` | Search command history |

## Editing

| Shortcut | Action |
|----------|--------|
| `Ctrl+U` | Delete from cursor to start |
| `Ctrl+K` | Delete from cursor to end |
| `Ctrl+W` | Delete previous word |
| `Ctrl+Y` | Paste deleted text |
| `Alt+U`  | Uppercase word |

## Process Control

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Kill current process |
| `Ctrl+Z` | Suspend process |
| `Ctrl+D` | Send EOF / exit shell |
| `Ctrl+L` | Clear screen |

## History

```bash
!!          # repeat last command
!git        # repeat last command starting with "git"
!$          # last argument of previous command
history | grep ssh
```
