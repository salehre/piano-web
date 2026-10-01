import { PIANO_TYPES, buildKeys } from './pianoTypes'

export interface KeyBinding {
  id: string
  /** مقدار KeyboardEvent.code؛ مستقل از زبان کیبورد (فارسی/انگلیسی) */
  code: string | null
  /** نت پیانو، مثل C4 یا F#3 */
  note: string
}

/** همه‌ی نت‌های ۸۸ کلید: A0 تا C8 */
export const ALL_NOTES: string[] = buildKeys(PIANO_TYPES.find((t) => t.keys === 88)!).map((k) => k.note)

/** نت‌ها گروه‌بندی‌شده بر اساس اکتاو (برای منوی انتخاب) */
export const NOTE_GROUPS = ALL_NOTES.reduce<{ octave: number; notes: string[] }[]>((groups, note) => {
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

export function createDefaultBindings(): KeyBinding[] {
  return DEFAULTS.map(([code, note]) => ({ id: `default-${code}`, code, note }))
}

export function createBindingId(): string {
  return `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function isValidBinding(v: unknown): v is KeyBinding {
  if (!v || typeof v !== 'object') return false
  const b = v as Record<string, unknown>
  return (
    typeof b.id === 'string' &&
    (b.code === null || typeof b.code === 'string') &&
    typeof b.note === 'string' &&
    ALL_NOTES.includes(b.note)
  )
}