import { SONGS, type Song } from '~/utils/songs'

export const SONG_LEAD_IN = 2500
export const SONG_SPEEDS = [0.5, 0.75, 1] as const

const LOOKAHEAD = 0.25
const VELOCITY = 0.6

let timer: ReturnType<typeof setInterval> | undefined
let raf = 0
let anchorClock = 0
let anchorPos = 0
let nextIndex = 0

export function useSongPlayer() {
  const { getClock, playNoteAt, releaseAll } = usePiano()

  const songId = useState<string | null>('song-id', () => null)
  const playing = useState('song-playing', () => false)
  const speed = useState<number>('song-speed', () => 1)
  const positionMs = useState('song-position', () => -SONG_LEAD_IN)

  const song = computed<Song | null>(() => SONGS.find((s) => s.id === songId.value) ?? null)

  function getPosition(): number {
    if (!playing.value) return positionMs.value
    return anchorPos + (getClock() - anchorClock) * 1000 * speed.value
  }

  function clearTimers() {
    if (timer) clearInterval(timer)
    timer = undefined
    cancelAnimationFrame(raf)
    raf = 0
  }

  function tick() {
    const s = song.value
    if (!s) return
    const now = getClock()
    const rate = speed.value

    while (nextIndex < s.notes.length) {
      const n = s.notes[nextIndex]!
      const at = anchorClock + (n.t - anchorPos) / 1000 / rate
      if (at > now + LOOKAHEAD) break
      playNoteAt(n.note, Math.max(0.08, (n.d / 1000 / rate) * 0.95), Math.max(at, now), VELOCITY)
      nextIndex++
    }

    if (getPosition() > s.durationMs + 700) stop()
  }

  function uiLoop() {
    positionMs.value = getPosition()
    raf = requestAnimationFrame(uiLoop)
  }

  function play() {
    const s = song.value
    if (!s || playing.value) return
    clearTimers()
    anchorPos = positionMs.value
    anchorClock = getClock() + 0.05
    nextIndex = s.notes.findIndex((n) => n.t >= anchorPos)
    if (nextIndex === -1) nextIndex = s.notes.length
    playing.value = true
    timer = setInterval(tick, 40)
    raf = requestAnimationFrame(uiLoop)
    tick()
  }

  function pause() {
    if (!playing.value) return
    positionMs.value = getPosition()
    playing.value = false
    clearTimers()
    releaseAll()
  }

  function stop() {
    playing.value = false
    clearTimers()
    releaseAll()
    positionMs.value = -SONG_LEAD_IN
  }

  function select(id: string | null) {
    stop()
    songId.value = id
  }

  function setSpeed(v: number) {
    if (playing.value) return
    speed.value = v
  }

  return { songs: SONGS, song, songId, playing, speed, positionMs, getPosition, play, pause, stop, select, setSpeed }
}