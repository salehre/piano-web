/**
 * فقط مشخصات ثابت مقاله‌ها اینجاست. عنوان، خلاصه و متن هر مقاله توی i18n/locales/<زبان>/blog.json
 * زیر blog.posts.<id> نوشته می‌شه و با useBlog() خونده می‌شه.
 * برای مقاله‌ی جدید: یه آبجکت به ابتدای این لیست اضافه کن + متنش رو توی blog.json هر دو زبان بنویس.
 */
export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }

export interface BlogPostMeta {
  /** کلید ترجمه (camelCase)؛ توی blog.json زیر blog.posts.<id> */
  id: string
  /** بخش آدرس مقاله؛ بین زبان‌ها مشترکه */
  slug: string
  date: string // YYYY-MM-DD
  readMinutes: number
  /** کلید برچسب توی blog.tags.<tag> */
  tag: 'beginners' | 'guides' | 'tips' | 'practice'
  image: string // مسیر عکس داخل public
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
