---
title: Regex Reference
description: Quick reference for regular expressions
---

# Regex Reference

## Character Classes

| Pattern | Matches |
|---------|---------|
| `.` | Any character except newline |
| `\d` | Digit (0-9) |
| `\w` | Word character (a-z, A-Z, 0-9, _) |
| `\s` | Whitespace |
| `[abc]` | a, b, or c |
| `[^abc]` | Not a, b, or c |

## Quantifiers

| Pattern | Meaning |
|---------|---------|
| `*` | 0 or more |
| `+` | 1 or more |
| `?` | 0 or 1 |
| `{3}` | Exactly 3 |
| `{3,6}` | Between 3 and 6 |

## Common Patterns

```regex
# Email
^[\w.-]+@[\w.-]+\.\w{2,}$

# URL
https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}

# Phone (international)
^\+?[1-9]\d{7,14}$

# Hex color
^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$

# IP Address
^(\d{1,3}\.){3}\d{1,3}$
```

## JavaScript Usage

```js
const email = /^[\w.-]+@[\w.-]+\.\w{2,}$/;
email.test("shehan@example.com"); // true

"hello world".replace(/\s+/g, "-"); // "hello-world"
"2026-04-07".match(/(\d{4})-(\d{2})-(\d{2})/);
```
