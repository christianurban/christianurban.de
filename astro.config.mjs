// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://christianurban.de',
  markdown: {
    shikiConfig: {
      // Farben kommen als CSS-Variablen, global.css wählt passend zum Farbschema
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
});
