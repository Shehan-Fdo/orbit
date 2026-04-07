---
title: DOM Manipulation
description: Working with the Document Object Model
---

# DOM Manipulation

The DOM is a tree of objects representing your HTML. JavaScript can read and modify it.

## Selecting Elements

```js
document.getElementById('app');
document.querySelector('.card');
document.querySelectorAll('li');
```

## Modifying Elements

```js
const el = document.querySelector('h1');

el.textContent = 'New Title';
el.innerHTML = '<strong>Bold</strong>';
el.classList.add('active');
el.classList.toggle('hidden');
el.setAttribute('data-id', 42);
el.style.color = 'red';
```

## Creating Elements

```js
const card = document.createElement('div');
card.className = 'card';
card.textContent = 'Hello!';
document.body.appendChild(card);
```

## Events

```js
btn.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('Clicked!', e.target);
});

// Event delegation
document.querySelector('ul').addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    e.target.classList.toggle('done');
  }
});
```
