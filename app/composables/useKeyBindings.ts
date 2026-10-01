import type { KeyBinding } from '~/utils/keyboard'

const STORAGE_KEY = 'web-piano:key-bindings:v1'
let loaded = false

/** تنظیمات اینکه هر کلید کیبورد کامپیوتر کدوم نت پیانو رو بزنه */
export const useKeyBindings = () => {
  const bindings = useState<KeyBinding[]>('key-bindings', createDefaultBindings)

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
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) bindings.value = parsed.filter(isValidBinding)
    } catch {
      // داده‌ی خراب: همون پیش‌فرض‌ها می‌مونن
    }
  }
  onMounted(load)

  function addBinding() {
    bindings.value = [...bindings.value, { id: createBindingId(), code: null, note: 'C4' }]
    persist()
  }

  function updateBinding(id: string, patch: Partial<Omit<KeyBinding, 'id'>>) {
    bindings.value = bindings.value.map((b) => (b.id === id ? { ...b, ...patch } : b))
    persist()
  }

  function removeBinding(id: string) {
    bindings.value = bindings.value.filter((b) => b.id !== id)
    persist()
  }

  function resetBindings() {
    bindings.value = createDefaultBindings()
    persist()
  }

  /** کد کلید → نت */
  const codeToNote = computed(
    () => new Map(bindings.value.filter((b) => b.code).map((b) => [b.code as string, b.note])),
  )

  /** نت → برچسب کلید(ها) برای نمایش روی پیانو */
  const noteLabels = computed(() => {
    const labels: Record<string, string> = {}
    for (const b of bindings.value) {
      if (!b.code) continue
      const label = formatKeyCode(b.code)
      labels[b.note] = labels[b.note] ? `${labels[b.note]} ${label}` : label
    }
    return labels
  })

  return { bindings, codeToNote, noteLabels, addBinding, updateBinding, removeBinding, resetBindings }
}