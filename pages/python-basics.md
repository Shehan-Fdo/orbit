---
title: Python Basics
description: Core Python concepts and syntax
---

# Python Basics

## Data Types

```python
name = "Shehan"         # str
age = 20                # int
height = 5.9            # float
is_dev = True           # bool
skills = ["js", "py"]   # list
info = {"lang": "py"}   # dict
```

## List Comprehensions

```python
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
flat = [n for row in matrix for n in row]
```

## Functions

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# Lambda
double = lambda x: x * 2

# *args and **kwargs
def log(*args, **kwargs):
    print(args, kwargs)
```

## File I/O

```python
# Read
with open("notes.txt", "r") as f:
    content = f.read()

# Write
with open("output.txt", "w") as f:
    f.write("Hello!")
```

## Error Handling

```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")
finally:
    print("Done")
```
