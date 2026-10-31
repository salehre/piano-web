// آهنگ‌های دامنه‌ی عمومی (public domain) به‌صورت نت‌نویسی فشرده.
//
// قالب هر آهنگ: چند «ترک» (دست راست / دست چپ) که هر کدوم یک رشته از توکن‌هاست:
//   C4:1        نت C4 به مدت ۱ beat
//   C4+E4+G4:2  آکورد (چند نت هم‌زمان) به مدت ۲ beat
//   r:1         سکوت ۱ beat
//   |           فقط برای خوانایی (خط میزان)؛ نادیده گرفته می‌شه
// فقط دیِز (#) داریم، بمل نداریم. beat = ۶۰۰۰۰ / bpm میلی‌ثانیه.

export type Hand = 'r' | 'l'

export interface SongNote {
  note: string
  /** شروع نت (میلی‌ثانیه از ابتدای آهنگ) */
  t: number
  /** طول نت (میلی‌ثانیه) */
  d: number
  hand: Hand
}

export interface Song {
  id: string
  title: Record<'fa' | 'en' | 'fr' | 'tr', string>
  composer: string
  level: 1 | 2
  notes: SongNote[]
  durationMs: number
}

const NOTE_RE = /^[A-G]#?-?\d$/

function parseTrack(src: string, bpm: number, hand: Hand): SongNote[] {
  const beat = 60000 / bpm
  const out: SongNote[] = []
  let cursor = 0
  for (const token of src.split(/\s+/)) {
    if (!token || token === '|') continue
    const [names = '', len = ''] = token.split(':')
    const beats = Number(len)
    if (!Number.isFinite(beats) || beats <= 0) {
      console.warn(`[songs] توکن نامعتبر: ${token}`)
      continue
    }
    if (names !== 'r') {
      for (const note of names.split('+')) {
        if (NOTE_RE.test(note)) out.push({ note, t: cursor, d: beats * beat, hand })
        else console.warn(`[songs] نت نامعتبر: ${token}`)
      }
    }
    cursor += beats * beat
  }
  return out
}

function define(
  meta: Omit<Song, 'notes' | 'durationMs'>,
  bpm: number,
  tracks: Partial<Record<Hand, string>>,
): Song {
  const notes = [
    ...(tracks.r ? parseTrack(tracks.r, bpm, 'r') : []),
    ...(tracks.l ? parseTrack(tracks.l, bpm, 'l') : []),
  ].sort((a, b) => a.t - b.t)
  const durationMs = notes.reduce((max, n) => Math.max(max, n.t + n.d), 0)
  return { ...meta, notes, durationMs }
}

// ---------------------------------------------------------------------------

const twinkle = define(
  {
    id: 'twinkle',
    title: {
      fa: 'ای ستاره‌ی کوچولو',
      en: 'Twinkle, Twinkle, Little Star',
      fr: 'Ah ! vous dirai-je, maman',
      tr: 'Parla Küçük Yıldız',
    },
    composer: 'Traditional',
    level: 1,
  },
  100,
  {
    r: `
      C4:1 C4:1 G4:1 G4:1 | A4:1 A4:1 G4:2 | F4:1 F4:1 E4:1 E4:1 | D4:1 D4:1 C4:2 |
      G4:1 G4:1 F4:1 F4:1 | E4:1 E4:1 D4:2 | G4:1 G4:1 F4:1 F4:1 | E4:1 E4:1 D4:2 |
      C4:1 C4:1 G4:1 G4:1 | A4:1 A4:1 G4:2 | F4:1 F4:1 E4:1 E4:1 | D4:1 D4:1 C4:4
    `,
  },
)

const mary = define(
  {
    id: 'mary',
    title: {
      fa: 'مری یک بره‌ی کوچک داشت',
      en: 'Mary Had a Little Lamb',
      fr: 'Mary avait un petit agneau',
      tr: "Mary'nin Küçük Kuzusu",
    },
    composer: 'Traditional',
    level: 1,
  },
  110,
  {
    r: `
      E4:1 D4:1 C4:1 D4:1 | E4:1 E4:1 E4:2 | D4:1 D4:1 D4:2 | E4:1 G4:1 G4:2 |
      E4:1 D4:1 C4:1 D4:1 | E4:1 E4:1 E4:1 E4:1 | D4:1 D4:1 E4:1 D4:1 | C4:4
    `,
  },
)

const ode = define(
  {
    id: 'ode',
    title: {
      fa: 'سرود شادی',
      en: 'Ode to Joy',
      fr: 'Ode à la joie',
      tr: 'Neşeye Ağıt',
    },
    composer: 'Beethoven',
    level: 1,
  },
  108,
  {
    r: `
      E4:1 E4:1 F4:1 G4:1 | G4:1 F4:1 E4:1 D4:1 | C4:1 C4:1 D4:1 E4:1 | E4:1.5 D4:0.5 D4:2 |
      E4:1 E4:1 F4:1 G4:1 | G4:1 F4:1 E4:1 D4:1 | C4:1 C4:1 D4:1 E4:1 | D4:1.5 C4:0.5 C4:2 |
      D4:1 D4:1 E4:1 C4:1 | D4:1 E4:0.5 F4:0.5 E4:1 C4:1 | D4:1 E4:0.5 F4:0.5 E4:1 D4:1 | C4:1 D4:1 G3:2 |
      E4:1 E4:1 F4:1 G4:1 | G4:1 F4:1 E4:1 D4:1 | C4:1 C4:1 D4:1 E4:1 | D4:1.5 C4:0.5 C4:4
    `,
  },
)

const birthday = define(
  {
    id: 'birthday',
    title: {
      fa: 'تولدت مبارک',
      en: 'Happy Birthday',
      fr: 'Joyeux anniversaire',
      tr: 'İyi ki Doğdun',
    },
    composer: 'Traditional',
    level: 1,
  },
  110,
  {
    r: `
      G4:0.75 G4:0.25 | A4:1 G4:1 C5:1 | B4:2 G4:0.75 G4:0.25 |
      A4:1 G4:1 D5:1 | C5:2 G4:0.75 G4:0.25 |
      G5:1 E5:1 C5:1 | B4:1 A4:1 F5:0.75 F5:0.25 |
      E5:1 C5:1 D5:1 | C5:3
    `,
  },
)

const jingle = define(
  {
    id: 'jingle',
    title: {
      fa: 'جینگل بلز',
      en: 'Jingle Bells',
      fr: 'Jingle Bells',
      tr: 'Jingle Bells',
    },
    composer: 'J. Pierpont',
    level: 1,
  },
  125,
  {
    r: `
      E4:1 E4:1 E4:2 | E4:1 E4:1 E4:2 | E4:1 G4:1 C4:1.5 D4:0.5 | E4:4 |
      F4:1 F4:1 F4:1.5 F4:0.5 | F4:1 E4:1 E4:1 E4:0.5 E4:0.5 | E4:1 D4:1 D4:1 E4:1 | D4:2 G4:2 |
      E4:1 E4:1 E4:2 | E4:1 E4:1 E4:2 | E4:1 G4:1 C4:1.5 D4:0.5 | E4:4 |
      F4:1 F4:1 F4:1.5 F4:0.5 | F4:1 E4:1 E4:1 E4:0.5 E4:0.5 | G4:1 G4:1 F4:1 D4:1 | C4:4
    `,
  },
)

// beat = یک هشتم؛ فقط تم اصلی (دو بار)
const FUR_ELISE_A = `
  E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 |
  A4:1 r:0.5 C4:0.5 E4:0.5 A4:0.5 |
  B4:1 r:0.5 E4:0.5 G#4:0.5 B4:0.5 |
  C5:1 r:0.5 E4:0.5 E5:0.5 D#5:0.5 |
  E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 |
  A4:1 r:0.5 C4:0.5 E4:0.5 A4:0.5 |
  B4:1 r:0.5 E4:0.5 C5:0.5 B4:0.5 |
`
const furElise = define(
  {
    id: 'fur-elise',
    title: {
      fa: 'برای الیز (تم اصلی)',
      en: 'Für Elise (main theme)',
      fr: 'Pour Élise (thème principal)',
      tr: 'Elise İçin (ana tema)',
    },
    composer: 'Beethoven',
    level: 2,
  },
  150,
  {
    r: `
      E5:0.5 D#5:0.5 |
      ${FUR_ELISE_A}
      A4:1.5 r:1 E5:0.5 D#5:0.5 |
      ${FUR_ELISE_A}
      A4:3
    `,
  },
)

// آکوردهای کانن: D A Bm F#m G D G A (هر کدوم ۲ beat)
const CANON_BASS = 'D3:2 A2:2 B2:2 F#2:2 G2:2 D2:2 G2:2 A2:2'
const CANON_MELODY = 'F#5:2 E5:2 D5:2 C#5:2 B4:2 A4:2 B4:2 C#5:2'
const CANON_ARPEGGIO = `
  D4:0.5 F#4:0.5 A4:0.5 F#4:0.5 | E4:0.5 A4:0.5 C#5:0.5 A4:0.5 |
  D4:0.5 F#4:0.5 B4:0.5 F#4:0.5 | C#4:0.5 F#4:0.5 A4:0.5 F#4:0.5 |
  D4:0.5 G4:0.5 B4:0.5 G4:0.5 | D4:0.5 F#4:0.5 A4:0.5 F#4:0.5 |
  D4:0.5 G4:0.5 B4:0.5 G4:0.5 | E4:0.5 A4:0.5 C#5:0.5 A4:0.5
`
const canon = define(
  {
    id: 'canon',
    title: {
      fa: 'کانن در ر ماژور',
      en: 'Canon in D',
      fr: 'Canon en ré majeur',
      tr: 'Re Majör Kanon',
    },
    composer: 'Pachelbel',
    level: 2,
  },
  72,
  {
    r: `${CANON_MELODY} | ${CANON_ARPEGGIO} | ${CANON_MELODY} | A4+D5+F#5:4`,
    l: `${CANON_BASS} | ${CANON_BASS} | ${CANON_BASS} | D3:4`,
  },
)

export const SONGS: Song[] = [twinkle, mary, ode, birthday, jingle, furElise, canon]