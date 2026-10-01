import { PIANO_TYPES, buildKeys } from './pianoTypes'

/** نت پیانو (مثل C4 یا F#3) → کد کلید کیبورد کامپیوتر؛ null یعنی هنوز تنظیم نشده */
export type KeyBindings = Record<string, string | null>

/** همه‌ی نت‌های ۸۸ کلید: A0 تا C8 */
export const ALL_NOTES: string[] = buildKeys(PIANO_TYPES.find((t) => t.keys === 88)!).map((k) => k.note)

export interface NoteGroup {
  octave: number
  notes: string[]
}

/** نت‌ها گروه‌بندی‌شده بر اساس اکتاو (برای صفحه‌ی تنظیمات) */
export const NOTE_GROUPS = ALL_NOTES.reduce<NoteGroup[]>((groups, note) => {
  const octave = Number(note.slice(-1))
  const last = groups[groups.length - 1]
  if (last && last.octave === octave) last.notes.push(note)
  else groups.push({ octave, notes: [note] })
  return groups
}, [])

/** کلیدهایی که به‌تنهایی نباید به نت وصل بشن */
export const MODIFIER_CODES = new Set([
  'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight',
  'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight', 'CapsLock', 'Tab',
])

const SPECIAL_NAMES: Record<string, string> = {
  Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/', Backslash: '\\',
  BracketLeft: '[', BracketRight: ']', Minus: '-', Equal: '=', Backquote: '`',
  Space: 'Space', Enter: 'Enter', Backspace: 'Backspace',
  ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓',
}

/** KeyA → A ، Digit1 → 1 ، Semicolon → ; */
export function formatKeyCode(code: string): string {
  if (SPECIAL_NAMES[code]) return SPECIAL_NAMES[code]
  if (code.startsWith('Key')) return code.slice(3)
  if (code.startsWith('Digit')) return code.slice(5)
  if (code.startsWith('Numpad')) return `Num ${code.slice(6)}`
  return code
}

const DEFAULTS: [code: string, note: string][] = [
  ['KeyA', 'C4'], ['KeyW', 'C#4'], ['KeyS', 'D4'], ['KeyE', 'D#4'], ['KeyD', 'E4'],
  ['KeyF', 'F4'], ['KeyT', 'F#4'], ['KeyG', 'G4'], ['KeyY', 'G#4'], ['KeyH', 'A4'],
  ['KeyU', 'A#4'], ['KeyJ', 'B4'], ['KeyK', 'C5'], ['KeyO', 'C#5'], ['KeyL', 'D5'],
  ['KeyP', 'D#5'], ['Semicolon', 'E5'],
]

/** یک ردیف برای هر ۸۸ نت؛ فقط نت‌های پیش‌فرض مقدار دارن و بقیه null (خالی) هستن */
export function createDefaultBindings(): KeyBindings {
  const bindings: KeyBindings = Object.fromEntries(ALL_NOTES.map((note) => [note, null]))
  for (const [code, note] of DEFAULTS) bindings[note] = code
  return bindings
}

/**
 * داده‌ی ذخیره‌شده (نسخه‌ی جدید: آبجکت نت → کد) رو به یک KeyBindings سالم تبدیل می‌کنه.
 * نت‌های ناشناخته، کدهای نامعتبر و کدهای تکراری نادیده گرفته می‌شن.
 */
export function sanitizeBindings(value: unknown): KeyBindings | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  const result: KeyBindings = Object.fromEntries(ALL_NOTES.map((note) => [note, null]))
  const used = new Set<string>()
  for (const note of ALL_NOTES) {
    const code = raw[note]
    if (typeof code === 'string' && code && !used.has(code)) {
      result[note] = code
      used.add(code)
    }
  }
  return result
}

/**
 * مهاجرت از فرمت قدیمی (آرایه‌ای از { id, code, note }).
 * اگه چند شورتکات برای یک نت بود، فقط اولی نگه داشته می‌شه.
 */
export function migrateLegacyBindings(value: unknown): KeyBindings | null {
  if (!Array.isArray(value)) return null
  const result: KeyBindings = Object.fromEntries(ALL_NOTES.map((note) => [note, null]))
  const used = new Set<string>()
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const { code, note } = item as Record<string, unknown>
    if (typeof code !== 'string' || !code || typeof note !== 'string') continue
    if (!(note in result) || result[note] !== null || used.has(code)) continue
    result[note] = code
    used.add(code)
  }
  return result
}