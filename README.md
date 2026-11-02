# christianurban.de
Source of my personal website christianurban.de – notes on software development, AI and GitHub, plus recipes, running, hiking and tennis. Built with Astro, hosted on GitHub Pages.

## Entwicklung

Voraussetzung: Node.js 22 oder neuer.

```bash
npm install
npm run dev      # Dev-Server auf http://localhost:4321
npm run build    # statische Seite nach dist/
npx astro check  # Typ-Check für Astro-Dateien und Content-Schemas
```

Jeder Push auf `main` baut die Seite und veröffentlicht sie über [GitHub Actions](.github/workflows/deploy.yml) auf GitHub Pages. Pull Requests werden nur gebaut.

## Aufbau

```text
src/
├── content/          Inhalte als Markdown, ein Ordner pro Rubrik
│   ├── notizen/
│   ├── meinung/
│   ├── rezepte/
│   └── talks/
├── content.config.ts Schemas der Rubriken (Pflichtfelder im Frontmatter)
├── components/       Header, Footer, Beitragskarte
├── layouts/          Basis-Layout mit Meta-Tags
├── lib/site.ts       Seitentitel, Rubriken, Hilfsfunktionen
├── pages/            Routen: Startseite, /<rubrik>/, /<rubrik>/<beitrag>/
└── styles/global.css Design-Tokens und Grundstile
```

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

Rezepte kennen zusätzlich `category`, `servings` und `time`, Talks `event` (Pflicht), `location`, `slides` und `video` – siehe [`src/content.config.ts`](src/content.config.ts).

Beiträge lassen sich auch direkt auf github.com anlegen (*Add file → Create new file*), etwa vom Handy aus.

## Lizenz

- **Code** (Astro-Setup, Layouts, Workflows): [MIT](LICENSE)
- **Inhalte** unter `src/content` (Texte, Rezepte, Bilder): [CC BY 4.0](src/content/LICENSE.md) – ausgenommen Fotos, auf denen andere Personen zu erkennen sind
