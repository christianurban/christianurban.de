// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
// Der Deploy-Workflow setzt SITE_URL und BASE_PATH aus actions/configure-pages,
// damit die Seite auch ohne eigene Domain unter <user>.github.io/<repo>/ funktioniert.
export default defineConfig({
  site: process.env.SITE_URL || 'https://www.christianurban.de',
  base: process.env.BASE_PATH || '/',
  // Erzeugt sitemap-index.xml beim Build, robots.txt verweist darauf
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      // Farben kommen als CSS-Variablen, global.css wählt passend zum Farbschema
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
});
