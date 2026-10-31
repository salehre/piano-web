// متن‌های بخش آهنگ‌ها (دکمه، دیالوگ و کنترل‌های روی فضای مشکی).
// برای زبانی که اینجا نیست، انگلیسی نشون داده می‌شه.
const SONG_TEXT = {
  fa: {
    songs: 'آهنگ‌ها',
    play: 'پخش',
    pause: 'توقف',
    stop: 'پایان',
    speed: 'سرعت',
    easy: 'آسان',
    medium: 'متوسط',
    dialogTitle: 'انتخاب آهنگ',
    dialogSubtitle: 'یک آهنگ انتخاب کن؛ پخش می‌شه و نت‌ها از بالا می‌آن، هم‌زمان باهاش بنواز',
    playNow: 'پخش',
  },
  en: {
    songs: 'Songs',
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    speed: 'Speed',
    easy: 'Easy',
    medium: 'Medium',
    dialogTitle: 'Choose a song',
    dialogSubtitle: 'Pick a song — it plays and the notes fall from above, so you can play along',
    playNow: 'Play',
  },
  fr: {
    songs: 'Morceaux',
    play: 'Lecture',
    pause: 'Pause',
    stop: 'Arrêter',
    speed: 'Vitesse',
    easy: 'Facile',
    medium: 'Moyen',
    dialogTitle: 'Choisir un morceau',
    dialogSubtitle: 'Choisissez un morceau : il joue et les notes tombent d’en haut, jouez avec',
    playNow: 'Lire',
  },
  tr: {
    songs: 'Şarkılar',
    play: 'Çal',
    pause: 'Duraklat',
    stop: 'Durdur',
    speed: 'Hız',
    easy: 'Kolay',
    medium: 'Orta',
    dialogTitle: 'Şarkı seç',
    dialogSubtitle: 'Bir şarkı seç; çalar ve notalar yukarıdan düşer, sen de eşlik et',
    playNow: 'Çal',
  },
} as const

type SongLang = keyof typeof SONG_TEXT

export function useSongText() {
  const { locale } = useI18n()
  const lang = computed<SongLang>(() => (locale.value in SONG_TEXT ? (locale.value as SongLang) : 'en'))
  const ui = computed(() => SONG_TEXT[lang.value])

  /** عنوان آهنگ به زبان فعلی */
  const titleOf = (s: { title: Record<SongLang, string> }) => s.title[lang.value]

  return { ui, titleOf }
}