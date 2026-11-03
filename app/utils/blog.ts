export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }

export interface BlogPostMeta {
  id: string
  slug: string
  date: string
  readMinutes: number
  tag: 'beginners' | 'guides' | 'tips' | 'practice'
  image: string
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    id: 'startLearning',
    slug: 'how-to-start-learning-piano-online',
    date: '2026-09-28',
    readMinutes: 4,
    tag: 'beginners',
    image: '/images/piano-finder-bg.webp',
  },
  {
    id: 'choosingKeys',
    slug: 'choosing-the-right-number-of-keys',
    date: '2026-09-21',
    readMinutes: 5,
    tag: 'guides',
    image: '/images/piano-finder-bg.webp',
  },
  {
    id: 'customShortcuts',
    slug: 'custom-keyboard-shortcuts-for-piano',
    date: '2026-09-14',
    readMinutes: 3,
    tag: 'tips',
    image: '/images/download.webp',
  },
  {
    id: 'earTraining',
    slug: 'five-minute-ear-training-exercises',
    date: '2026-09-07',
    readMinutes: 4,
    tag: 'practice',
    image: '/images/download.webp',
  },
]
