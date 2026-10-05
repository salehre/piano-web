export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string // YYYY-MM-DD
  readMinutes: number
  tag: string
  image: string // مسیر عکس داخل public، مثلا /images/xxx.webp
  content: BlogBlock[]
}

/** مقاله‌های بلاگ؛ برای اضافه کردن مقاله‌ی جدید یه آبجکت به ابتدای این لیست اضافه کن */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-start-learning-piano-online',
    title: 'How to start learning piano online',
    excerpt: 'You do not need a real piano to begin. Here is a simple plan for your first weeks.',
    date: '2026-09-28',
    readMinutes: 4,
    tag: 'Beginners',
    image: '/images/piano-finder-bg.webp',
    content: [
      {
        type: 'p',
        text: 'Starting piano can feel intimidating, but the first steps are small. With a virtual piano in your browser you can build finger familiarity, ear training and rhythm before you ever buy an instrument.',
      },
      { type: 'h2', text: 'Learn the layout first' },
      {
        type: 'p',
        text: 'The keyboard repeats the same pattern of white and black keys. Black keys come in groups of two and three, and the white key just before a group of two is always C. Once you can find C, you can find every other note.',
      },
      { type: 'h2', text: 'Practice a little every day' },
      {
        type: 'ul',
        items: [
          'Ten to fifteen focused minutes beat one long session per week.',
          'Start with one hand, slowly, and only add speed when it feels easy.',
          'Say the note names out loud as you play them.',
          'Finish each session with something you enjoy, even if it is simple.',
        ],
      },
      { type: 'h2', text: 'Try recording yourself' },
      {
        type: 'p',
        text: 'Recording a short phrase and listening back is one of the fastest ways to notice uneven rhythm or wrong notes. It also lets you track your progress over the weeks.',
      },
    ],
  },
  {
    slug: 'choosing-the-right-number-of-keys',
    title: '25, 49, 61 or 88 keys? Choosing the right piano size',
    excerpt: 'More keys are not always better. Here is how to pick a size that fits your music.',
    date: '2026-09-21',
    readMinutes: 5,
    tag: 'Guides',
    image: '/images/piano-finder-bg.webp',
    content: [
      {
        type: 'p',
        text: 'A full piano has 88 keys, spanning seven octaves plus a few extra notes, from A0 to C8. Smaller keyboards simply cut off the lowest and highest octaves.',
      },
      { type: 'h2', text: 'What each size is good for' },
      {
        type: 'ul',
        items: [
          '25 and 37 keys: quick melodies and simple ideas, easiest on small screens.',
          '49 keys: a comfortable all-round choice for beginners and for most pop and film melodies.',
          '61 keys: five octaves, enough for many songs with both hands.',
          '76 and 88 keys: needed for a lot of classical repertoire that uses the extreme low and high notes.',
        ],
      },
      { type: 'h2', text: 'Let the music decide' },
      {
        type: 'p',
        text: 'Look at the lowest and highest notes in the pieces you want to play. If they fit in five octaves, a 61-key layout is plenty. If you are not sure, the piano finder on the home page can suggest a size from your goals and level.',
      },
    ],
  },
  {
    slug: 'custom-keyboard-shortcuts-for-piano',
    title: 'Make your computer keyboard feel like a piano',
    excerpt: 'Custom shortcuts help you play faster and more comfortably. Here is how to set them up.',
    date: '2026-09-14',
    readMinutes: 3,
    tag: 'Tips',
    image: '/images/download.webp',
    content: [
      {
        type: 'p',
        text: 'Playing with the computer keyboard is fast, but only if the layout feels natural to your hands. That is why every note in Web Piano can be mapped to any key you like.',
      },
      { type: 'h2', text: 'Setting your own shortcuts' },
      {
        type: 'ul',
        items: [
          'Open Settings and find the octave you want to change.',
          'Click the field next to a note, then press the key you want to use.',
          'If a key is already taken, clear the other shortcut first.',
          'Use Reset to defaults any time you want a fresh start.',
        ],
      },
      { type: 'h2', text: 'Design tips' },
      {
        type: 'p',
        text: 'Keep white notes on one row and the matching black notes on the row above, like a real keyboard. Group each octave under neighbouring keys so your fingers move in a predictable pattern.',
      },
    ],
  },
  {
    slug: 'five-minute-ear-training-exercises',
    title: 'Five-minute ear training exercises you can do anywhere',
    excerpt: 'Training your ear makes everything else easier. These short drills fit into any break.',
    date: '2026-09-07',
    readMinutes: 4,
    tag: 'Practice',
    image: '/images/download.webp',
    content: [
      {
        type: 'p',
        text: 'Ear training means learning to recognize notes, intervals and chords by sound. It speeds up learning songs and makes improvising more natural.',
      },
      { type: 'h2', text: 'Three quick drills' },
      {
        type: 'ul',
        items: [
          'Hum then play: sing a note, then find it on the piano.',
          'Up or down: play two notes and decide whether the second is higher or lower, then check.',
          'Copy a melody: pick a tune you know and find it by ear, one note at a time.',
        ],
      },
      { type: 'h2', text: 'Make it a habit' },
      {
        type: 'p',
        text: 'Five minutes a day is enough. Keep the drills light and playful, and you will notice progress within a few weeks.',
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}

export function formatBlogDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}