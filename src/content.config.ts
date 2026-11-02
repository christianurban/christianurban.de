import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Gemeinsame Felder aller Beiträge
const base = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

const markdown = (dir: string) => glob({ pattern: '**/*.md', base: `./src/content/${dir}` });

export const collections = {
  notizen: defineCollection({ loader: markdown('notizen'), schema: base }),
  meinung: defineCollection({ loader: markdown('meinung'), schema: base }),
};
