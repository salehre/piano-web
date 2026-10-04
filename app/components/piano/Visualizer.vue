<script setup lang="ts">
// ستون‌های عمودیِ طیف صدا (spectrum analyzer) که با صدای پیانو بالا و پایین می‌رن
const { getSpectrum } = usePiano()

const canvas = ref<HTMLCanvasElement | null>(null)

const BARS = 32
const FMIN = 40 // پایین‌ترین فرکانس نمایش داده‌شده (Hz)
const FMAX = 9000 // بالاترین فرکانس نمایش داده‌شده (Hz)
const DB_MIN = -90 // سطح صدایی که ستون صفر حساب می‌شه
const DB_MAX = -28 // سطح صدایی که ستون پر حساب می‌شه

const levels = new Float32Array(BARS) // ارتفاع فعلی هر ستون (۰ تا ۱)
const peaks = new Float32Array(BARS) // نوک‌های کوچیکی که آروم میفتن

let ctx: CanvasRenderingContext2D | null = null
let width = 0
let height = 0
let raf = 0
let observer: ResizeObserver | null = null

function resize() {
  const c = canvas.value
  if (!c) return
  const dpr = window.devicePixelRatio || 1
  const rect = c.getBoundingClientRect()
  width = rect.width
  height = rect.height
  c.width = Math.round(width * dpr)
  c.height = Math.round(height * dpr)
  ctx = c.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function update() {
  const s = getSpectrum()
  const ratio = FMAX / FMIN

  for (let i = 0; i < BARS; i++) {
    let target = 0

    if (s) {
      // هر ستون یک بازه‌ی فرکانسی لگاریتمی (مثل گوش انسان) رو نشون می‌ده
      const binHz = s.sampleRate / 2 / s.data.length
      const f0 = FMIN * ratio ** (i / BARS)
      const f1 = FMIN * ratio ** ((i + 1) / BARS)
      const b0 = Math.min(s.data.length - 1, Math.floor(f0 / binHz))
      const b1 = Math.min(s.data.length - 1, Math.max(b0, Math.floor(f1 / binHz)))

      let db = DB_MIN
      for (let b = b0; b <= b1; b++) {
        const v = s.data[b] ?? DB_MIN
        if (v > db) db = v
      }

      // فرکانس‌های بالا انرژی کمتری دارن؛ کمی تقویتشون می‌کنیم تا ستون‌های سمت راست هم زنده باشن
      db += (i / BARS) * 22
      const t = Math.min(1, Math.max(0, (db - DB_MIN) / (DB_MAX - DB_MIN)))
      target = t ** 1.2
    }

    const prev = levels[i]!
    // بالا رفتن سریع، پایین اومدن نرم
    levels[i] = target > prev ? prev + (target - prev) * 0.6 : prev * 0.9
    peaks[i] = Math.max(levels[i]!, peaks[i]! - 0.012)
  }
}

function draw() {
  const g = ctx
  if (!g || width === 0) return

  g.clearRect(0, 0, width, height)

  const gap = width > 240 ? 3 : width > 150 ? 2 : 1
  const barW = (width - gap * (BARS - 1)) / BARS
  const radius = Math.min(barW / 2, 2.5)

  const grad = g.createLinearGradient(0, height, 0, 0)
  grad.addColorStop(0, '#8a5a12')
  grad.addColorStop(0.55, '#e0a526')
  grad.addColorStop(1, '#f6d27f')

  for (let i = 0; i < BARS; i++) {
    const lv = levels[i]!
    const bh = Math.max(2, lv * height)
    const x = i * (barW + gap)

    // ستون‌های ساکت کم‌رنگ‌ترن
    g.globalAlpha = 0.3 + 0.7 * Math.min(1, lv * 1.5)
    g.fillStyle = grad
    g.beginPath()
    if (g.roundRect) g.roundRect(x, height - bh, barW, bh, radius)
    else g.rect(x, height - bh, barW, bh)
    g.fill()

    // نوک کوچیکِ بالای ستون
    const pk = peaks[i]!
    if (pk > 0.06) {
      g.globalAlpha = 0.9
      g.fillStyle = '#f6d27f'
      g.fillRect(x, Math.max(0, height - pk * height - 4), barW, 2)
    }
  }
  g.globalAlpha = 1
}

function frame() {
  update()
  draw()
  raf = requestAnimationFrame(frame)
}

onMounted(() => {
  resize()
  if (canvas.value) {
    observer = new ResizeObserver(resize)
    observer.observe(canvas.value)
  }
  frame()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  observer?.disconnect()
})
</script>

<template>
  <!-- قاب شیشه‌ای کوچیک؛ اندازه‌اش رو صفحه‌ی بالادستی با class می‌ده (مثلاً h-9 w-32) -->
  <div
      class="rounded-xl bg-black/25 px-2 py-1 ring-1 ring-white/15 shadow-[inset_0_0_6px_-3px_rgba(255,255,255,0.7)]"
  >
    <canvas ref="canvas" class="block h-full w-full" aria-hidden="true" />
  </div>
</template>