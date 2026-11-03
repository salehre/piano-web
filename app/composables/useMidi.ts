export interface MidiDevice {
  id: string
  name: string
  manufacturer: string
  connected: boolean
}

export type MidiStatus = 'idle' | 'requesting' | 'ready' | 'denied' | 'unsupported' | 'insecure' | 'error'

export interface MidiNoteEvent {
  note: string
  velocity: number
  source: string
  at: number
}

const STORAGE_KEY = 'web-piano:midi-input:v1'
const LOWEST_MIDI = 21 // A0
const HIGHEST_MIDI = 108 // C8
export const SIMULATED_SOURCE = 'simulated'

let access: MIDIAccess | null = null
let started = false
const held = new Map<string, Set<number>>()

export const useMidi = () => {
  const { noteOn, noteOff } = usePiano()

  const status = useState<MidiStatus>('midi-status', () => 'idle')
  const devices = useState<MidiDevice[]>('midi-devices', () => [])
  const selectedId = useState<string>('midi-selected', () => 'all')
  const lastNote = useState<MidiNoteEvent | null>('midi-last-note', () => null)

  function releaseSource(sourceId: string) {
    const notes = held.get(sourceId)
    if (!notes) return
    for (const m of notes) noteOff(midiToNote(m))
    held.delete(sourceId)
  }

  function handleMessage(sourceId: string, data: ArrayLike<number>, force = false) {
    if (data.length < 2) return
    const command = data[0]! & 0xf0
    const d1 = data[1]!
    const d2 = data[2] ?? 0

    if (command === 0xb0 && d1 === 123) {
      releaseSource(sourceId)
      return
    }

    const isOn = command === 0x90 && d2 > 0
    const isOff = command === 0x80 || (command === 0x90 && d2 === 0)
    if ((!isOn && !isOff) || d1 < LOWEST_MIDI || d1 > HIGHEST_MIDI) return

    const note = midiToNote(d1)

    if (isOn) {
      if (!force && selectedId.value !== 'all' && selectedId.value !== sourceId) return
      const notes = held.get(sourceId) ?? new Set<number>()
      notes.add(d1)
      held.set(sourceId, notes)
      noteOn(note, d2 / 127)
      lastNote.value = { note, velocity: d2, source: sourceId, at: Date.now() }
    } else {
      if (!held.get(sourceId)?.delete(d1)) return
      noteOff(note)
    }
  }

  function refreshDevices() {
    if (!access) return
    const list: MidiDevice[] = []
    access.inputs.forEach((input) => {
      const connected = input.state === 'connected'
      list.push({
        id: input.id,
        name: input.name || '',
        manufacturer: input.manufacturer || '',
        connected,
      })
      input.onmidimessage = connected ? (e) => e.data && handleMessage(input.id, e.data) : null
      if (!connected) releaseSource(input.id)
    })
    devices.value = list
  }

  async function connect() {
    if (access || status.value === 'requesting') return
    if (!('requestMIDIAccess' in navigator)) {
      status.value = 'unsupported'
      return
    }
    if (!window.isSecureContext) {
      status.value = 'insecure'
      return
    }
    status.value = 'requesting'
    try {
      access = await navigator.requestMIDIAccess()
      access.onstatechange = () => refreshDevices()
      status.value = 'ready'
      refreshDevices()
    } catch (err) {
      const name = (err as DOMException | undefined)?.name
      status.value = name === 'SecurityError' || name === 'NotAllowedError' ? 'denied' : 'error'
      if (status.value === 'error') console.error(err)
    }
  }

  function selectDevice(id: string) {
    selectedId.value = id
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
    }
  }

  async function autoConnect() {
    if (started) return
    started = true
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) selectedId.value = saved
    } catch {
      // ignore
    }
    if (!('requestMIDIAccess' in navigator)) {
      status.value = 'unsupported'
      return
    }
    if (!window.isSecureContext) {
      status.value = 'insecure'
      return
    }
    try {
      const permission = await navigator.permissions.query({ name: 'midi' as PermissionName })
      if (permission.state === 'granted') await connect()
      else if (permission.state === 'denied') status.value = 'denied'
    } catch {
    }
  }

  function playTestNote(midi = 60, velocity = 100) {
    handleMessage(SIMULATED_SOURCE, [0x90, midi, velocity], true)
    setTimeout(() => handleMessage(SIMULATED_SOURCE, [0x80, midi, 0], true), 600)
  }

  return { status, devices, selectedId, lastNote, connect, autoConnect, selectDevice, playTestNote }
}