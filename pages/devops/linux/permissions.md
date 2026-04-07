---
title: Linux File Permissions
description: Understanding chmod, chown, and permission bits
---

# Linux File Permissions

## Permission Structure

```
-rwxr-xr--  1  shehan  staff  4096  Apr 7  file.sh
│└──┬───┘       └──┬──┘
│   │             owner
│   └── permissions (owner|group|others)
└── type (- file, d directory, l symlink)
```

## Permission Values

| Symbol | Octal | Meaning |
|--------|-------|---------|
| `r` | 4 | Read |
| `w` | 2 | Write |
| `x` | 1 | Execute |

## chmod

```bash
chmod 755 script.sh     # rwxr-xr-x
chmod 644 file.txt      # rw-r--r--
chmod +x script.sh      # add execute for all
chmod u+w,g-w file.txt  # symbolic mode
chmod -R 755 /var/www   # recursive
```

## chown

```bash
chown shehan file.txt
chown shehan:staff file.txt
chown -R shehan:staff /var/www
```

## Special Permissions

```bash
chmod +s binary   # setuid/setgid
chmod +t /tmp     # sticky bit (only owner can delete)
```
