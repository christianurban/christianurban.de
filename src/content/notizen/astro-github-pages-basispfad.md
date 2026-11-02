---
title: Astro auf GitHub Pages – mit und ohne eigene Domain
description: Ohne eigene Domain liegt die Seite in einem Unterpfad. Mit actions/configure-pages übernimmt Astro den richtigen Basispfad automatisch.
date: 2026-11-02
tags: [astro, github-pages, github-actions]
---

Ein Projekt-Repo auf GitHub Pages landet zunächst unter `<user>.github.io/<repo>/`. Baut Astro die Seite für `/`, zeigen CSS, Favicon und alle internen Links ins Leere. Sobald eine eigene Domain eingerichtet ist, liegt die Seite wieder unter `/` – der Basispfad ändert sich also im Laufe des Projekts.

## Den Pfad aus `configure-pages` übernehmen

Die Action `actions/configure-pages` kennt die aktuelle Adresse und gibt sie als Outputs `origin` und `base_path` heraus. Die reiche ich als Umgebungsvariablen an den Build weiter:

```yaml
- name: Configure Pages
  id: pages
  uses: actions/configure-pages@v6

- name: Set site URL and base path
  run: |
    echo "SITE_URL=${{ steps.pages.outputs.origin }}" >> "$GITHUB_ENV"
    echo "BASE_PATH=${{ steps.pages.outputs.base_path }}" >> "$GITHUB_ENV"

- name: Build
  uses: withastro/action@v6
```

`withastro/action` ist eine Composite Action – Variablen aus `$GITHUB_ENV` kommen dort zuverlässig an.

In `astro.config.mjs`:

```js
export default defineConfig({
  site: process.env.SITE_URL || 'https://christianurban.de',
  base: process.env.BASE_PATH || '/',
});
```

Lokal greifen die Standardwerte, in CI der echte Pfad. Mit eigener Domain ist `base_path` leer – es muss nichts umgestellt werden.

## Interne Links

Assets wie CSS versieht Astro selbst mit dem Basispfad, eigene Links aber nicht. Dafür reicht ein kleiner Helfer:

```ts
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (path: string) => `${base}${path}`;
```

Und dann überall `href={url('/notizen/')}` statt `href="/notizen/"`.

## Stolperfalle beim lokalen Test unter Windows

Wer unter Git Bash `BASE_PATH=/christianurban.de npm run build` ausprobiert, bekommt Links wie `/C:/Program Files/Git/christianurban.de/`. Git Bash wandelt Werte, die wie Unix-Pfade aussehen, in Windows-Pfade um. Abhilfe: `MSYS_NO_PATHCONV=1` voranstellen. In GitHub Actions tritt das Problem nicht auf.
