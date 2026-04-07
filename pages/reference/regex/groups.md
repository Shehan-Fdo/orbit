---
title: Regex Groups & Lookaheads
description: Advanced regex with capture groups and assertions
---

# Regex Groups & Lookaheads

## Capture Groups

```regex
(\d{4})-(\d{2})-(\d{2})
```

```js
const match = "2026-04-07".match(/(\d{4})-(\d{2})-(\d{2})/);
// match[1] = "2026", match[2] = "04", match[3] = "07"
```

## Named Groups

```js
const { year, month, day } = "2026-04-07"
  .match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/)
  .groups;
```

## Non-Capturing Groups

```regex
(?:https?|ftp)://\S+
```

## Lookahead & Lookbehind

```
# Positive lookahead — match "foo" only if followed by "bar"
foo(?=bar)

# Negative lookahead — match "foo" NOT followed by "bar"
foo(?!bar)

# Positive lookbehind — match "bar" only if preceded by "foo"
(?<=foo)bar

# Negative lookbehind
(?<!foo)bar
```

## Practical Example

```js
// Extract price values
const prices = "$10.99 and $4.50".match(/(?<=\$)\d+\.\d{2}/g);
// ["10.99", "4.50"]
```
