import { SONGS, type Song } from '~/utils/songs'

// پخش‌کننده‌ی آهنگ: نت‌ها رو با ساعت صوتی زمان‌بندی می‌کنه (جلوتر از موعد، با یک پنجره‌ی کوچیک)
// و موقعیت فعلی آهنگ رو برای کشیدن نت‌های در حال سقوط می‌ده.

/** مدتی که قبل از اولین نت صبر می‌کنیم تا نت‌ها از بالا برسن (میلی‌ثانیه) */
export const SONG_LEAD_IN = 2500
export const SONG_SPEEDS = [0.5, 0.75, 1] as const

const LOOKAHEAD = 0.25 // چند ثانیه جلوتر نت‌ها رو برای صدا زمان‌بندی می‌کنیم
const VELOCITY = 0.6 // کمی آروم‌تر از نواختن خود کاربر

// حالت داخلی (فقط سمت کلاینت)
let timer: ReturnType<typeof setInterval> | undefined
let raf = 0
let anchorClock = 0 // ساعت صوتی (ثانیه) در لحظه‌ی شروع/ادامه
let anchorPos = 0 // موقعیت آهنگ (میلی‌ثانیه) در همون لحظه
let nextIndex = 0 // اولین نتی که هنوز زمان‌بندی نشده

export function useSongPlayer() {
  const { getClock, playNoteAt, releaseAll } = usePiano()

  const songId = useState<string | null>('song-id', () => null)
  const playing = useState('song-playing', () => false)
  const speed = useState<number>('song-speed', () => 1)
  /** موقعیت آهنگ (میلی‌ثانیه)؛ قبل از شروع منفیه (صبر برای رسیدن نت‌ها) */
  const positionMs = useState('song-position', () => -SONG_LEAD_IN)

  const song = computed<Song | null>(() => SONGS.find((s) => s.id === songId.value) ?? null)

  /** موقعیت دقیق همین لحظه؛ نت‌های در حال سقوط هر فریم از همین می‌خونن */
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

    // بعد از آخرین نت (و کمی صبر برای محو شدن صدا) تموم می‌شه
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

  /** سرعت فقط وقتی پخش نمی‌شه عوض می‌شه (نت‌های زمان‌بندی‌شده رو نمی‌شه پس گرفت) */
  function setSpeed(v: number) {
    if (playing.value) return
    speed.value = v
  }

  return { songs: SONGS, song, songId, playing, speed, positionMs, getPosition, play, pause, stop, select, setSpeed }
}