import type { BlogBlock } from '~/utils/blog'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  tag: string
  image: string
  dateLabel: string
  readMinutes: number
  content: BlogBlock[]
}

interface RawBlock {
  type: BlogBlock['type']
  text?: unknown
  items?: unknown[]
}

export function useBlog() {
  const { t, tm, rt, d, locale } = useI18n()
  const text = (m: unknown) =>
    typeof m === 'string' ? rt(m as Parameters<typeof rt>[0]) : ''

  function localize(meta: BlogPostMeta): BlogPost {
    const base = `blog.posts.${meta.id}`
    const raw = tm(`${base}.content`) as unknown as RawBlock[]
    const content = (Array.isArray(raw) ? raw : []).map((b): BlogBlock =>
      b.type === 'ul'
        ? { type: 'ul', items: (b.items ?? []).map(text) }
        : { type: b.type, text: text(b.text) },
    )
    return {
      slug: meta.slug,
      title: t(`${base}.title`),
      excerpt: t(`${base}.excerpt`),
      tag: t(`blog.tags.${meta.tag}`),
      image: meta.image,
      dateLabel: d(new Date(`${meta.date}T00:00:00`), 'long'),
      readMinutes: meta.readMinutes,
      content,
    }
  }

  const posts = computed(() => (locale.value ? BLOG_POSTS.map(localize) : []))
  const getPost = (slug: string) => posts.value.find((p) => p.slug === slug)

  return { posts, getPost }
}
