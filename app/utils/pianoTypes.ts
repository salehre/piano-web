export interface PianoType {
  keys: number
  from: string
  to: string
  description: string
}

export interface PianoKey {
  note: string
  midi: number
  isBlack: boolean
}

export const PIANO_TYPES: PianoType[] = [
  { keys: 25, from: 'C3', to: 'C5', description: 'Pocket-size controllers you can carry anywhere.' },
  { keys: 37, from: 'C3', to: 'C6', description: 'Small desktop keyboards with three octaves.' },
  { keys: 49, from: 'C2', to: 'C6', description: 'A common starter size with four octaves.' },
  { keys: 61, from: 'C2', to: 'C7', description: 'Five octaves, popular for learning and for organs.' },
  { keys: 76, from: 'E1', to: 'G7', description: 'Stage keyboards with a near-full range.' },
  { keys: 88, from: 'A0', to: 'C8', description: 'The full piano, from the lowest to the highest note.' },
]

export const DEFAULT_PIANO_KEYS = 61

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function noteToMidi(note: string): number {
  const m = note.match(/^([A-G]#?)(-?\d)$/)
  if (!m) throw new Error(`Invalid note: ${note}`)
  return NOTE_NAMES.indexOf(m[1]!) + (Number(m[2]) + 1) * 12
}

export function midiToNote(midi: number): string {
  return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`
}

export function buildKeys(type: PianoType): PianoKey[] {
  const keys: PianoKey[] = []
  for (let midi = noteToMidi(type.from); midi <= noteToMidi(type.to); midi++) {
    const note = midiToNote(midi)
    keys.push({ note, midi, isBlack: note.includes('#') })
  }
  return keys
}

/** مقدار کوئری (?keys=61) رو به یک نوع پیانو تبدیل می‌کنه؛ اگه نامعتبر بود پیش‌فرض رو برمی‌گردونه */
export function getPianoType(value: unknown): PianoType {
  const raw = Array.isArray(value) ? value[0] : value
  const n = Number(raw)
  return (
    PIANO_TYPES.find((t) => t.keys === n) ??
    PIANO_TYPES.find((t) => t.keys === DEFAULT_PIANO_KEYS)!
  )
}