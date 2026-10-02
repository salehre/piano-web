import type * as ToneNS from 'tone'

// این‌ها فقط سمت کلاینت ساخته می‌شن (SSR کاری باهاشون نداره)
let Tone: typeof ToneNS | null = null
let sampler: ToneNS.Sampler | null = null
let recorder: ToneNS.Recorder | null = null
let analyser: ToneNS.Analyser | null = null
let master: ToneNS.Volume | null = null

// ضبط و پخش: رویدادهای نت با زمان (میلی‌ثانیه از شروع ضبط) + فایل صوتی برای دانلود
interface RecEvent {
  t: number
  note: string
  on: boolean
  velocity: number
}
let recorded: RecEvent[] = []
let audioBlob: Blob | null = null
let recStart = 0
let playStart = 0
let playTimers: ReturnType<typeof setTimeout>[] = []
let raf = 0

const SAMPLE_BASE_URL = 'https://tonejs.github.io/audio/salamander/'

// نمونه‌صداهای Salamander برای کل ۸۸ کلید: A0 تا C8
// (Tone.js بقیه‌ی نت‌ها رو از نزدیک‌ترین نمونه می‌سازه)
function buildSampleUrls(): Record<string, string> {
  const urls: Record<string, string> = { A0: 'A0.mp3' }
  for (let o = 1; o <= 7; o++) {
    urls[`C${o}`] = `C${o}.mp3`
    urls[`D#${o}`] = `Ds${o}.mp3`
    urls[`F#${o}`] = `Fs${o}.mp3`
    urls[`A${o}`] = `A${o}.mp3`
  }
  urls.C8 = 'C8.mp3'
  return urls
}

// اسلایدر ۰ تا ۱ به دسی‌بل (مجذور مقدار، تا حس تغییر صدا یکنواخت‌تر باشه)
function volumeToDb(v: number) {
  return v <= 0.001 ? -100 : Math.max(-100, 40 * Math.log10(v))
}

export const usePiano = () => {
  const status = useState<'idle' | 'loading' | 'ready' | 'error'>('piano-status', () => 'idle')
  const active = useState<string[]>('piano-active', () => [])

  const recording = useState('piano-recording', () => false)
  const playing = useState('piano-playing', () => false)
  const saving = useState('piano-saving', () => false) // بعد از Stop، تا وقتی فایل صوتی آماده بشه
  const canDownload = useState('piano-can-download', () => false)
  const recordedCount = useState('piano-recorded-count', () => 0)
  const recordedMs = useState('piano-recorded-ms', () => 0)
  const timerMs = useState('piano-timer-ms', () => 0) // زمان زنده‌ی ضبط یا پخش

  const volume = useCookie<number>('piano-volume', { default: () => 0.8, maxAge: 60 * 60 * 24 * 365 })
  function setVolume(v: number) {
    volume.value = Math.min(1, Math.max(0, v))
    master?.volume.rampTo(volumeToDb(volume.value), 0.05)
  }

  /** باید از داخل یک کلیک/لمس کاربر صدا زده بشه (محدودیت مرورگر برای صدا) */
  async function init() {
    if (status.value === 'ready' || status.value === 'loading') return
    status.value = 'loading'
    try {
      Tone = await import('tone')
      await Tone.start()

      if (!master) master = new Tone!.Volume(volumeToDb(volume.value)).toDestination()

      await new Promise<void>((resolve, reject) => {
        sampler = new Tone!.Sampler({
          urls: buildSampleUrls(),
          release: 1,
          baseUrl: SAMPLE_BASE_URL,
          onload: () => resolve(),
          onerror: (e) => reject(e),
        }).connect(master!)
      })

      analyser = new Tone!.Analyser({ type: 'fft', size: 1024, smoothing: 0.5 })
      master?.connect(analyser)

      // خروجی پیانو به ضبط‌کننده هم وصل می‌شه (اگه مرورگر پشتیبانی کنه)
      if (Tone!.Recorder.supported) {
        recorder = new Tone!.Recorder()
        sampler?.connect(recorder)
      }
      status.value = 'ready'
    } catch (err) {
      console.error(err)
      status.value = 'error'
    }
  }

  /** velocity بین ۰ تا ۱ — بعداً از MIDI/سخت‌افزار میاد */
  function noteOn(note: string, velocity = 0.8) {
    if (status.value !== 'ready' || !sampler || !Tone) return
    if (active.value.includes(note)) return
    sampler.triggerAttack(note, Tone.now(), velocity)
    active.value = [...active.value, note]
    if (recording.value) record({ t: performance.now() - recStart, note, on: true, velocity })
  }

  function noteOff(note: string) {
    if (!sampler || !Tone) return
    if (!active.value.includes(note)) return
    sampler.triggerRelease(note, Tone.now())
    active.value = active.value.filter((n) => n !== note)
    if (recording.value) record({ t: performance.now() - recStart, note, on: false, velocity: 0 })
  }

  function record(e: RecEvent) {
    recorded.push(e)
    recordedCount.value = recorded.length
  }

  // تایمر زنده: موقع ضبط زمان سپری‌شده، موقع پخش جای فعلی پخش
  function loop() {
    if (recording.value) timerMs.value = performance.now() - recStart
    else if (playing.value) timerMs.value = Math.min(performance.now() - playStart, recordedMs.value)
    else return
    raf = requestAnimationFrame(loop)
  }
  function startLoop() {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(loop)
  }

  async function startRecording() {
    if (status.value !== 'ready' || recording.value || saving.value) return
    stopPlayback()
    recorded = []
    audioBlob = null
    canDownload.value = false
    recStart = performance.now()
    // نت‌هایی که همین الان نگه داشته شدن هم از ثانیه‌ی صفر ثبت می‌شن
    for (const n of active.value) recorded.push({ t: 0, note: n, on: true, velocity: 0.8 })
    recordedCount.value = recorded.length
    recordedMs.value = 0
    timerMs.value = 0
    recording.value = true
    startLoop()
    try {
      await recorder?.start()
    } catch (err) {
      console.error(err)
    }
  }

  async function stopRecording() {
    if (!recording.value) return
    const t = performance.now() - recStart
    // نت‌هایی که موقع توقف هنوز نگه داشته شدن، توی پخش همین‌جا رها می‌شن
    for (const n of active.value) recorded.push({ t, note: n, on: false, velocity: 0 })
    recordedMs.value = t
    timerMs.value = t
    recordedCount.value = recorded.length
    recording.value = false

    if (!recorder) return
    saving.value = true
    try {
      // کمی صبر می‌کنیم تا ته صدای آخرین نت‌ها (release) هم ضبط بشه
      await new Promise((r) => setTimeout(r, 600))
      audioBlob = await recorder.stop()
      canDownload.value = !!audioBlob && audioBlob.size > 0
    } catch (err) {
      console.error(err)
    } finally {
      saving.value = false
    }
  }

  function play() {
    if (recording.value || saving.value || recorded.length === 0) return
    stopPlayback()
    playing.value = true
    playStart = performance.now()
    timerMs.value = 0
    startLoop()
    for (const e of recorded) {
      playTimers.push(setTimeout(() => (e.on ? noteOn(e.note, e.velocity) : noteOff(e.note)), e.t))
    }
    playTimers.push(setTimeout(stopPlayback, recordedMs.value + 400))
  }

  function stopPlayback() {
    playTimers.forEach(clearTimeout)
    playTimers = []
    if (!playing.value) return
    playing.value = false
    timerMs.value = recordedMs.value
    for (const n of [...active.value]) noteOff(n)
  }

  function clearRecording() {
    if (saving.value) return
    stopPlayback()
    recorded = []
    audioBlob = null
    recordedCount.value = 0
    recordedMs.value = 0
    timerMs.value = 0
    canDownload.value = false
  }

  /** طیف فرکانسی لحظه‌ای خروجی پیانو (برای نمایشگر) */
  function getSpectrum() {
    if (!analyser || !Tone) return null
    return { data: analyser.getValue() as Float32Array, sampleRate: Tone.getContext().sampleRate }
  }

  function downloadRecording() {
    if (!audioBlob) return
    const type = audioBlob.type
    const ext = type.includes('webm') ? 'webm' : type.includes('ogg') ? 'ogg' : type.includes('mp4') ? 'm4a' : 'audio'
    const url = URL.createObjectURL(audioBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `piano-recording.${ext}`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return {
    status, active, init, noteOn, noteOff,
    recording, playing, saving, canDownload, recordedCount, recordedMs, timerMs,
    startRecording, stopRecording, play, stopPlayback, clearRecording, downloadRecording,
    getSpectrum, volume, setVolume,
  }
}