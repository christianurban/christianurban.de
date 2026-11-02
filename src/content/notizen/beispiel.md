---
title: Beispiel-Notiz
description: Zeigt, wie ein Beitrag aufgebaut ist. Als Entwurf markiert – erscheint nur im Dev-Server.
date: 2026-11-02
tags: [astro, markdown]
draft: true
---

Ein Beitrag ist eine Markdown-Datei unter `src/content/<rubrik>/`. Oben steht das Frontmatter mit Titel, Beschreibung, Datum und Tags, darunter der Text.

## Zwischenüberschrift

Fließtext mit **Hervorhebung**, einem [Link](https://astro.build) und `Inline-Code`.

- Listenpunkt eins
- Listenpunkt zwei

> Ein Zitat oder ein Hinweis.

```ts
const greeting = (name: string) => `Hallo ${name}!`;
console.log(greeting('Welt'));
```
