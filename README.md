# christianurban.de
Source of my personal website christianurban.de – notes on software development, AI and GitHub, plus recipes, running, hiking and tennis. Built with Astro, hosted on GitHub Pages.

## Entwicklung

Voraussetzung: Node.js 22 oder neuer.

```bash
npm install
npm run dev      # Dev-Server auf http://localhost:4321
npm run build    # statische Seite nach dist/, danach Suchindex mit Pagefind
npm run preview  # gebaute Seite ansehen – nur hier funktioniert die Suche
npx astro check  # Typ-Check für Astro-Dateien und Content-Schemas
```

Jeder Push auf `main` baut die Seite und veröffentlicht sie über [GitHub Actions](.github/workflows/deploy.yml) auf GitHub Pages. Pull Requests werden nur gebaut.

## Aufbau

```text
src/
├── content/          Inhalte als Markdown, ein Ordner pro Rubrik
│   ├── notizen/
│   ├── meinung/
│   └── seiten/       Einzelseiten: /now, Impressum, Datenschutz
├── content.config.ts Schemas der Rubriken (Pflichtfelder im Frontmatter)
├── components/       Header, Footer, Beitragskarte
├── layouts/          Basis-Layout mit Meta-Tags
├── lib/site.ts       Seitentitel, Rubriken, Hilfsfunktionen
├── pages/            Routen: Startseite, /<rubrik>/, /<rubrik>/<beitrag>/, /suche/
└── styles/global.css Design-Tokens und Grundstile
```

## Suche

Die Volltextsuche unter `/suche/` läuft komplett auf der eigenen Seite: [Pagefind](https://pagefind.app/) erzeugt nach `astro build` einen statischen Index in `dist/pagefind/`, ohne Drittanbieter. Indexiert wird nur, was in einem Beitrag innerhalb von `data-pagefind-body` steht – Navigation, Footer, Rubrik- und Themenlisten sowie Einzelseiten nicht. Die Sprache (Deutsch, für die Wortstämme) liest Pagefind aus `<html lang="de">`.

## Neuen Beitrag anlegen

Eine Markdown-Datei unter `src/content/<rubrik>/` anlegen – der Dateiname wird zur URL (`src/content/notizen/mein-thema.md` → `/notizen/mein-thema/`).

```markdown
---
title: Mein Thema
description: Ein Satz, der in der Übersicht und in Suchmaschinen erscheint.
date: 2026-11-02
tags: [astro, github-actions]
draft: true   # optional: nur im Dev-Server sichtbar
---

Hier beginnt der Text.
```

Beiträge lassen sich auch direkt auf github.com anlegen (*Add file → Create new file*), etwa vom Handy aus.

## /now aktualisieren

Die Seite [/now](https://christianurban.de/now/) steht in [`src/content/seiten/now.md`](src/content/seiten/now.md). Text ändern und `updated` im Frontmatter auf das aktuelle Datum setzen – das geht auch direkt auf github.com.

## Lizenz

- **Code** (Astro-Setup, Layouts, Workflows): [MIT](LICENSE)
- **Inhalte** unter `src/content` (Texte, Bilder): [CC BY 4.0](src/content/LICENSE.md) – ausgenommen Fotos, auf denen andere Personen zu erkennen sind
- **Porträtfoto** `src/assets/christian-urban.jpg`: alle Rechte vorbehalten, weder MIT noch CC BY
