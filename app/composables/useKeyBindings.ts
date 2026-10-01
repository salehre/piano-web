import type { KeyBindings } from '~/utils/keyboard'

const STORAGE_KEY = 'web-piano:key-bindings:v2'
const LEGACY_STORAGE_KEY = 'web-piano:key-bindings:v1'
let loaded = false

/** تنظیمات اینکه هر کلید کیبورد کامپیوتر کدوم نت پیانو رو بزنه (یک ردیف برای هر ۸۸ نت) */
export const useKeyBindings = () => {
  const bindings = useState<KeyBindings>('key-bindings', createDefaultBindings)

  function persist() {
    if (import.meta.server) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings.value))
    } catch {
      // مثلاً حالت private یا پر بودن حافظه؛ تنظیمات فقط تا آخر همین نشست می‌مونن
    }
  }

  // بعد از mount خونده می‌شه تا با HTML سمت سرور تداخلی پیش نیاد
  function load() {
    if (loaded) return
    loaded = true
    try {
      const current = localStorage.getItem(STORAGE_KEY)
      if (current) {
        const parsed = sanitizeBindings(JSON.parse(current))
        if (parsed) bindings.value = parsed
        return
      }
      // اگه تنظیمات نسخه‌ی قبلی (لیستی) ذخیره شده بود، یک بار تبدیلش می‌کنیم
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
      if (legacy) {
        const migrated = migrateLegacyBindings(JSON.parse(legacy))
        if (migrated) {
          bindings.value = migrated
          persist()
        }
      }
    } catch {
      // داده‌ی خراب: همون پیش‌فرض‌ها می‌مونن
    }
  }
  onMounted(load)

  /** کلید کامپیوتر رو به یک نت وصل می‌کنه */
  function setBinding(note: string, code: string) {
    bindings.value = { ...bindings.value, [note]: code }
    persist()
  }

  /** شورتکات یک نت رو خالی می‌کنه */
  function clearBinding(note: string) {
    bindings.value = { ...bindings.value, [note]: null }
    persist()
  }

  function resetBindings() {
    bindings.value = createDefaultBindings()
    persist()
  }

  /** کد کلید → نت */
  const codeToNote = computed(
    () =>
      new Map(
        Object.entries(bindings.value)
          .filter((entry): entry is [string, string] => !!entry[1])
          .map(([note, code]) => [code, note]),
      ),
  )

  /** نت → برچسب کلید برای نمایش روی پیانو */
  const noteLabels = computed(() => {
    const labels: Record<string, string> = {}
    for (const [note, code] of Object.entries(bindings.value)) {
      if (code) labels[note] = formatKeyCode(code)
    }
    return labels
  })

  return { bindings, codeToNote, noteLabels, setBinding, clearBinding, resetBindings }
}