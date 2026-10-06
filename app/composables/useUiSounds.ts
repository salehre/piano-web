import { play, setEnabled, setTheme, setVolume, themes } from 'cuelume'
import type { PlayOptions, SoundName, ThemeName } from 'cuelume'

interface UiSoundPrefs {
  enabled: boolean
  volume: number
  theme: ThemeName
}

const STORAGE_KEY = 'ui-sounds'
const DEFAULTS: UiSoundPrefs = { enabled: true, volume: 0.6, theme: 'default' }

export const useUiSounds = () => {
  const prefs = useState<UiSoundPrefs>('ui-sounds', () => ({ ...DEFAULTS }))

  function apply() {
    setEnabled(prefs.value.enabled)
    setVolume(prefs.value.volume)
    setTheme(prefs.value.theme)
  }

  /** خوندن تنظیمات ذخیره‌شده؛ فقط سمت کلاینت و بعد از mount صدا زده بشه */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<UiSoundPrefs>
        prefs.value = {
          enabled: typeof saved.enabled === 'boolean' ? saved.enabled : DEFAULTS.enabled,
          volume: typeof saved.volume === 'number' ? Math.min(1, Math.max(0, saved.volume)) : DEFAULTS.volume,
          theme: (themes as readonly string[]).includes(saved.theme as string) ? (saved.theme as ThemeName) : DEFAULTS.theme,
        }
      }
    } catch {
      // localStorage در دسترس نیست یا خراب بود؛ با پیش‌فرض‌ها ادامه می‌دیم
    }
    apply()
  }

  function update(patch: Partial<UiSoundPrefs>) {
    prefs.value = { ...prefs.value, ...patch }
    apply()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs.value))
    } catch {
      // ذخیره نشد؛ مشکلی نیست
    }
  }

  /** پخش یک صدا از کد (سمت سرور هیچ کاری نمی‌کنه) */
  function cue(name?: SoundName, options?: PlayOptions) {
    if (import.meta.client) play(name, options)
  }

  return { prefs, load, update, cue }
}