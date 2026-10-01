import type * as ToneNS from 'tone'

// این‌ها فقط سمت کلاینت ساخته می‌شن (SSR کاری باهاشون نداره)
let Tone: typeof ToneNS | null = null
let sampler: ToneNS.Sampler | null = null

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
          urls: buildSampleUrls(),
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