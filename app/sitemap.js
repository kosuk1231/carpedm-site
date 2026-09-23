import { PROGRAMS } from './data/programs';

const SITE = 'https://www.carpedm.kr';

export default function sitemap() {
  const now = new Date();
  return [
    { url: SITE, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    ...PROGRAMS.map((p) => ({
      url: `${SITE}/programs/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
  ];
}
