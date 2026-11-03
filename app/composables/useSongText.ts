// عنوان آهنگ‌ها توی خود دیتای آهنگ‌هاست (نه توی i18n/locales)؛ این‌جا فقط زبان فعلی انتخاب می‌شه.
// برای زبانی که اینجا نیست، انگلیسی نشون داده می‌شه.
type SongLang = 'fa' | 'en' | 'fr' | 'tr'
const SONG_LANGS: readonly string[] = ['fa', 'en', 'fr', 'tr']

export function useSongText() {
  const { locale } = useI18n()
  const lang = computed<SongLang>(() => (SONG_LANGS.includes(locale.value) ? (locale.value as SongLang) : 'en'))

  /** عنوان آهنگ به زبان فعلی */
  const titleOf = (s: { title: Record<SongLang, string> }) => s.title[lang.value]

  return { titleOf }
}
