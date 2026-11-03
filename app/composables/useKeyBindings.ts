import type { KeyBindings } from '~/utils/keyboard'

const STORAGE_KEY = 'web-piano:key-bindings:v2'
const LEGACY_STORAGE_KEY = 'web-piano:key-bindings:v1'
let loaded = false

export const useKeyBindings = () => {
  const bindings = useState<KeyBindings>('key-bindings', createDefaultBindings)

  function persist() {
    if (import.meta.server) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings.value))
    } catch {
    }
  }

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
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
      if (legacy) {
        const migrated = migrateLegacyBindings(JSON.parse(legacy))
        if (migrated) {
          bindings.value = migrated
          persist()
        }
      }
    } catch {
    }
  }
  onMounted(load)

  function setBinding(note: string, code: string) {
    bindings.value = { ...bindings.value, [note]: code }
    persist()
  }

  function clearBinding(note: string) {
    bindings.value = { ...bindings.value, [note]: null }
    persist()
  }

  function resetBindings() {
    bindings.value = createDefaultBindings()
    persist()
  }

  const codeToNote = computed(
    () =>
      new Map(
        Object.entries(bindings.value)
          .filter((entry): entry is [string, string] => !!entry[1])
          .map(([note, code]) => [code, note]),
      ),
  )

  const noteLabels = computed(() => {
    const labels: Record<string, string> = {}
    for (const [note, code] of Object.entries(bindings.value)) {
      if (code) labels[note] = formatKeyCode(code)
    }
    return labels
  })

  return { bindings, codeToNote, noteLabels, setBinding, clearBinding, resetBindings }
}