---
title: Vim Reference
description: Essential Vim commands to survive and thrive
---

# Vim Reference

## Modes

| Mode | Key | Purpose |
|------|-----|---------|
| Normal | `Esc` | Navigate and run commands |
| Insert | `i` | Type text |
| Visual | `v` | Select text |
| Command | `:` | Run ex commands |

## Navigation

```
h j k l     ← ↓ ↑ →
w / b       next / prev word
0 / $       start / end of line
gg / G      top / bottom of file
Ctrl+d/u    half page down/up
```

## Editing

```
i / a       insert before / after cursor
o / O       new line below / above
dd          delete line
yy          yank (copy) line
p           paste below
u           undo
Ctrl+r      redo
.           repeat last action
```

## Search & Replace

```
/pattern        search forward
?pattern        search backward
n / N           next / prev match
:%s/old/new/g   replace all
```

## Saving & Quitting

```
:w      save
:q      quit
:wq     save and quit
:q!     quit without saving
```

> The hardest part of Vim is that first time you can't figure out how to exit.
