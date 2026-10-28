// اسکرین‌ریکورد با MediaRecorder + getDisplayMedia (فقط سمت کلاینت)
let mediaRecorder: MediaRecorder | null = null
let displayStream: MediaStream | null = null
let chunks: Blob[] = []
let videoBlob: Blob | null = null
let startedAt = 0
let raf = 0
let discard = false

const MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4',
]

function pickMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m))
}

export const useScreenRecorder = () => {
  const supported = useState('screen-supported', () => false)
  const recording = useState('screen-recording', () => false)
  const hasVideo = useState('screen-has-video', () => false)
  const timerMs = useState('screen-timer-ms', () => 0)
  const error = useState<string | null>('screen-error', () => null)

  /** باید بعد از mount صدا زده بشه (SSR به مرورگر دسترسی نداره) */
  function checkSupport() {
    supported.value =
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getDisplayMedia &&
      typeof MediaRecorder !== 'undefined'
  }

  function tick() {
    if (!recording.value) return
    timerMs.value = performance.now() - startedAt
    raf = requestAnimationFrame(tick)
  }

  function releaseDisplay() {
    displayStream?.getTracks().forEach((t) => t.stop())
    displayStream = null
  }

  /**
   * @param audio استریم صدای پیانو (اختیاری)؛ اگه بدی توی ویدیو هم صدا هست
   * باید از داخل یک کلیک کاربر صدا زده بشه
   */
  async function start(audio?: MediaStream | null) {
    if (recording.value || !supported.value) return
    error.value = null

    try {
      // preferCurrentTab فقط یه پیشنهاده (کروم)؛ بقیه مرورگرها نادیده‌ش می‌گیرن
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: false,
        preferCurrentTab: true,
      } as DisplayMediaStreamOptions)
    } catch (err) {
      // کاربر پنجره‌ی انتخاب رو بسته → خطا نیست
      if ((err as DOMException).name !== 'NotAllowedError') {
        console.error(err)
        error.value = 'failed'
      }
      return
    }

    const stream = new MediaStream([
      ...displayStream.getVideoTracks(),
      ...(audio?.getAudioTracks() ?? []),
    ])

    const mimeType = pickMime()
    try {
      mediaRecorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: 5_000_000,
      })
    } catch (err) {
      console.error(err)
      error.value = 'failed'
      releaseDisplay()
      return
    }

    chunks = []
    videoBlob = null
    discard = false
    hasVideo.value = false

    const recorder = mediaRecorder
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }
    recorder.onstop = () => {
      recording.value = false
      cancelAnimationFrame(raf)
      releaseDisplay()
      if (!discard && chunks.length) {
        videoBlob = new Blob(chunks, { type: recorder.mimeType || mimeType || 'video/webm' })
        hasVideo.value = videoBlob.size > 0
      }
      chunks = []
      mediaRecorder = null
    }

    // وقتی کاربر از دکمه‌ی خود مرورگر («Stop sharing») ضبط رو می‌بنده
    displayStream.getVideoTracks()[0]?.addEventListener('ended', () => stop())

    recorder.start(1000)
    startedAt = performance.now()
    timerMs.value = 0
    recording.value = true
    raf = requestAnimationFrame(tick)
  }

  function stop() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop()
    else releaseDisplay()
  }

  /** ضبط جاری (اگه هست) قطع و دور ریخته می‌شه — مثلاً موقع خروج از صفحه */
  function abort() {
    discard = true
    stop()
  }

  function clear() {
    if (recording.value) return
    videoBlob = null
    hasVideo.value = false
    timerMs.value = 0
    error.value = null
  }

  function download() {
    if (!videoBlob) return
    const ext = videoBlob.type.includes('mp4') ? 'mp4' : 'webm'
    const url = URL.createObjectURL(videoBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `piano-screen-recording.${ext}`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return { supported, recording, hasVideo, timerMs, error, checkSupport, start, stop, abort, clear, download }
}