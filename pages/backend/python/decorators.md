---
title: Python Decorators
description: Understanding and writing Python decorators
---

# Python Decorators

A decorator wraps a function to extend its behavior without modifying it directly.

## Basic Decorator

```python
def logger(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Done {func.__name__}")
        return result
    return wrapper

@logger
def greet(name):
    print(f"Hello, {name}!")
```

## With Arguments

```python
def repeat(n):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(n):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(3)
def say_hi():
    print("Hi!")
```

## Using functools.wraps

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)  # preserves function metadata
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

## Common Built-in Decorators

```python
class MyClass:
    @staticmethod
    def static_method(): ...

    @classmethod
    def class_method(cls): ...

    @property
    def value(self): return self._value
```
