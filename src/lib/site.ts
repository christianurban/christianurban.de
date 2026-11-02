import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE = {
  title: 'Christian Urban',
  description:
    'Notizen zu Softwareentwicklung, KI und GitHub – dazu Rezepte, Laufen, Wandern und Tennis.',
  github: 'https://github.com/christianurban',
};

export type SectionKey = 'notizen' | 'meinung' | 'rezepte' | 'talks';

export const SECTIONS: Record<SectionKey, { label: string; description: string }> = {
  notizen: {
    label: 'Notizen',
    description: 'Kurze Learnings aus eigenen Projekten – Claude Code, Copilot, GitHub Actions und mehr.',
  },
  meinung: {
    label: 'Meinung',
    description: 'Längere Gedanken dazu, wie sich Softwareentwicklung durch KI verändert.',
  },
  rezepte: {
    label: 'Rezepte',
    description: 'Was bei uns zu Hause auf den Tisch kommt – erprobt und alltagstauglich.',
  },
  talks: {
    label: 'Talks',
    description: 'Öffentliche Vorträge mit Slides und Notizen.',
  },
};

export const SECTION_KEYS = Object.keys(SECTIONS) as SectionKey[];

export type Post = CollectionEntry<SectionKey>;

// Entwürfe sind nur im Dev-Server sichtbar
export async function getPosts(section: SectionKey): Promise<Post[]> {
  const entries: Post[] = await getCollection(section, ({ data }) => import.meta.env.DEV || !data.draft);
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getAllPosts(): Promise<Post[]> {
  const all = await Promise.all(SECTION_KEYS.map(getPosts));
  return all.flat().sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// Interne Links mit Basispfad, solange die Seite unter christianurban.github.io/christianurban.de/ liegt
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (path: string) => `${base}${path}`;

export const postUrl = (post: Post) => url(`/${post.collection}/${post.id}/`);

const dateFormat = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
export const formatDate = (date: Date) => dateFormat.format(date);
