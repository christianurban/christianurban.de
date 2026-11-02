# christianurban.de
Source of my personal website christianurban.de – notes on software development, AI and GitHub, plus recipes, running, hiking and tennis. Built with Astro, hosted on GitHub Pages.

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server auf http://localhost:4321
npm run build    # statische Seite nach dist/
```

Beiträge sind Markdown-Dateien unter `src/content/<rubrik>/` (`notizen`, `meinung`, `rezepte`, `talks`). Mit `draft: true` im Frontmatter erscheint ein Beitrag nur im Dev-Server.
