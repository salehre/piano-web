import type * as ToneNS from 'tone'

// این‌ها فقط سمت کلاینت ساخته می‌شن (SSR کاری باهاشون نداره)
let Tone: typeof ToneNS | null = null
let sampler: ToneNS.Sampler | null = null

const SAMPLE_BASE_URL = 'https://tonejs.github.io/audio/salamander/'

export const usePiano = () => {
  const status = useState<'idle' | 'loading' | 'ready' | 'error'>('piano-status', () => 'idle')
  const active = useState<string[]>('piano-active', () => [])

  /** باید از داخل یک کلیک/لمس کاربر صدا زده بشه (محدودیت مرورگر برای صدا) */
  async function init() {
    if (status.value === 'ready' || status.value === 'loading') return
    status.value = 'loading'
    try {
      Tone = await import('tone')
      await Tone.start()

      await new Promise<void>((resolve, reject) => {
        sampler = new Tone!.Sampler({
          urls: {
            A1: 'A1.mp3', C2: 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3',
            A2: 'A2.mp3', C3: 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3',
            A3: 'A3.mp3', C4: 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3',
            A4: 'A4.mp3', C5: 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3',
            A5: 'A5.mp3', C6: 'C6.mp3',
          },
          release: 1,
          baseUrl: SAMPLE_BASE_URL,
          onload: () => resolve(),
          onerror: (e) => reject(e),
        }).toDestination()
      })
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
  }

  function noteOff(note: string) {
    if (!sampler || !Tone) return
    if (!active.value.includes(note)) return
    sampler.triggerRelease(note, Tone.now())
    active.value = active.value.filter((n) => n !== note)
  }

  return { status, active, init, noteOn, noteOff }
}