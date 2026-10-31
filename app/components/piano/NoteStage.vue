<script setup lang="ts">
// فضای مشکیِ بالای پیانو: با فشردن هر نت، یک ستون از بالای همون کلید شروع می‌شه،
// تا وقتی نگه داشته‌ایم بلندتر می‌شه و بعد از رها کردن بالا می‌ره و محو می‌شه.
// وقتی آهنگ انتخاب شده، نت‌های آهنگ هم از بالا می‌آن پایین و لحظه‌ی صدا شدن به کلید می‌رسن.
const props = defineProps<{
  /** مرکز و عرض هر کلید به درصدِ عرض کیبورد (همون هندسه‌ی کلیدها) */
  layout: Record<string, { x: number; w: number }>
}>()

const { active } = usePiano()
const player = useSongPlayer()

const canvas = ref<HTMLCanvasElement | null>(null)

const SPEED = 0.14 // سرعت بالا رفتن ستون‌ها (پیکسل بر میلی‌ثانیه)
const FALL = 0.2 // سرعت سقوط نت‌های آهنگ (پیکسل بر میلی‌ثانیه‌ی آهنگ)
const MAX_BARS = 160 // سقف ستون‌ها تا موقع نواختن خیلی سریع کند نشه

interface Bar {
  note: string
  black: boolean
  start: number // لحظه‌ی فشردن
  end: number | null // لحظه‌ی رها کردن (null یعنی هنوز نگه داشته شده)
}

let bars: Bar[] = []
let ctx: CanvasRenderingContext2D | null = null
let width = 0
let height = 0
let raf = 0
let running = false
let observer: ResizeObserver | null = null

// اسم بزرگ وسط صفحه: آخرین نتی که زده شده
const label = ref('')
let labelTimer: ReturnType<typeof setTimeout> | undefined
const prettyLabel = computed(() => label.value.replace('#', '♯'))

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
  if (!running) draw()
}

// رنگ نت‌های آهنگ: دست راست فیروزه‌ای، دست چپ آبی (جدا از ستون‌های طلاییِ نواختن کاربر)
const SONG_COLORS = {
  r: { fill: '#2dd4bf', glow: 'rgba(94, 234, 212, 0.65)' },
  l: { fill: '#38bdf8', glow: 'rgba(125, 211, 252, 0.65)' },
} as const

// نت‌های آهنگ: از بالا می‌افتن؛ لبه‌ی پایین ستون = لحظه‌ی شروع نت و وقتی به کلید برسه صداش میاد
function drawSong() {
  const g = ctx
  const s = player.song.value
  if (!g || !s) return
  const T = player.getPosition()

  for (const n of s.notes) {
    const ahead = n.t - T
    if (ahead * FALL > height) break // نت‌ها به ترتیب زمان مرتب هستن؛ بقیه هنوز بالای صفحه‌ان
    const endAhead = n.t + n.d - T
    if (endAhead <= 0) continue // تموم شده و رد شده

    const pos = props.layout[n.note]
    if (!pos) continue // این نت توی محدوده‌ی پیانوی انتخاب‌شده نیست

    const yBottom = Math.min(height, height - ahead * FALL)
    const yTop = height - endAhead * FALL + 2 // ۲ پیکسل فاصله بین دو نت پشت‌سرهم
    const h = Math.max(4, yBottom - yTop)
    if (yBottom <= 0) continue

    const w = Math.max(2, (pos.w / 100) * width - 2)
    const x = (pos.x / 100) * width - w / 2
    const c = SONG_COLORS[n.hand]
    const hit = ahead <= 0 // الان داره صدا می‌ده

    g.globalAlpha = hit ? 1 : 0.85
    g.shadowColor = c.glow
    g.shadowBlur = hit ? 18 : 8
    g.fillStyle = c.fill
    g.beginPath()
    if (g.roundRect) g.roundRect(x, yBottom - h, w, h, Math.min(w / 2, 4))
    else g.rect(x, yBottom - h, w, h)
    g.fill()
  }
  g.shadowBlur = 0
  g.globalAlpha = 1
}

function draw() {
  const g = ctx
  if (!g || width === 0) return
  g.clearRect(0, 0, width, height)

  drawSong()

  const now = performance.now()
  const next: Bar[] = []

  for (const b of bars) {
    const pos = props.layout[b.note]
    // کف ستون: وقتی نگه داشته شده روی کلیده؛ بعد از رها کردن بالا می‌ره
    const bottomOffset = b.end === null ? 0 : (now - b.end) * SPEED
    const topOffset = (now - b.start) * SPEED
    // کاملاً از بالای صفحه رد شده؛ حذف می‌شه
    if (bottomOffset > height) continue
    next.push(b)
    if (!pos) continue

    const yBottom = height - bottomOffset
    const yTop = Math.max(0, height - topOffset)
    const h = yBottom - yTop
    if (h <= 0) continue

    const w = Math.max(2, (pos.w / 100) * width - 1)
    const x = (pos.x / 100) * width - w / 2
    const radius = Math.min(w / 2, 4)

    // هرچی بالاتر می‌ره کم‌رنگ‌تر می‌شه
    const fade = 1 - Math.min(1, (height - yBottom) / height) * 0.85
    g.globalAlpha = Math.max(0.05, fade)

    const grad = g.createLinearGradient(0, yTop, 0, yBottom)
    if (b.black) {
      grad.addColorStop(0, '#8a6212')
      grad.addColorStop(1, '#d79b21')
    } else {
      grad.addColorStop(0, '#b98a22')
      grad.addColorStop(1, '#f3cd72')
    }
    g.shadowColor = 'rgba(231, 185, 79, 0.55)'
    g.shadowBlur = 10
    g.fillStyle = grad
    g.beginPath()
    if (g.roundRect) g.roundRect(x, yTop, w, h, radius)
    else g.rect(x, yTop, w, h)
    g.fill()
  }

  g.shadowBlur = 0
  g.globalAlpha = 1
  bars = next
}

function frame() {
  draw()
  if (bars.length === 0 && !player.playing.value) {
    running = false
    raf = 0
    return
  }
  raf = requestAnimationFrame(frame)
}

function start() {
  if (running) return
  running = true
  raf = requestAnimationFrame(frame)
}

// تفاوت نت‌های فعال قبلی و فعلی: نت تازه → ستون جدید، نت رها شده → پایان ستون
watch(active, (cur, prev) => {
  const now = performance.now()
  const before = new Set(prev)
  const after = new Set(cur)

  for (const note of cur) {
    if (before.has(note)) continue
    bars.push({ note, black: note.includes('#'), start: now, end: null })
    label.value = note
    clearTimeout(labelTimer)
  }
  if (bars.length > MAX_BARS) bars = bars.slice(bars.length - MAX_BARS)

  for (const note of prev) {
    if (after.has(note)) continue
    // آخرین ستونِ بازِ همون نت رو می‌بندیم
    for (let i = bars.length - 1; i >= 0; i--) {
      const b = bars[i]!
      if (b.note === note && b.end === null) {
        b.end = now
        break
      }
    }
  }

  // وقتی دیگه هیچ نتی نگه داشته نشده، اسم بزرگ بعد از مدتی محو می‌شه
  if (cur.length === 0) {
    clearTimeout(labelTimer)
    labelTimer = setTimeout(() => (label.value = ''), 1400)
  }

  if (bars.length) start()
})

// آهنگ انتخاب/پخش/متوقف شد یا موقعیتش عوض شد: اگه حلقه خوابه بیدارش کن (حداقل یک بار می‌کشه)
watch(
  () => [player.songId.value, player.playing.value, player.positionMs.value],
  () => start(),
)

onMounted(() => {
  resize()
  if (canvas.value) {
    observer = new ResizeObserver(resize)
    observer.observe(canvas.value)
  }
})

onBeforeUnmount(() => {
  running = false
  cancelAnimationFrame(raf)
  clearTimeout(labelTimer)
  observer?.disconnect()
})
</script>

<template>
  <!-- پس‌زمینه‌ی مشکیِ ثابت (مستقل از تم)؛ px-3 هم‌اندازه‌ی کادر کلیدهاست تا ستون‌ها دقیقاً بالای کلید خودشون بیفتن -->
  <div class="note-stage relative min-h-72 flex-1 overflow-hidden rounded-t-lg bg-black px-3">
    <canvas ref="canvas" class="absolute inset-y-0 left-3 right-3 block h-full w-[calc(100%-1.5rem)]" aria-hidden="true" />

    <!-- انتخاب آهنگ و کنترل پخش -->
    <PianoSongPanel />

    <div class="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
      <Transition name="stage-label" mode="out-in">
        <span
            v-if="label"
            :key="label"
            class="select-none text-5xl font-semibold tracking-tight text-stone-100/90 sm:text-6xl"
        >
          {{ prettyLabel }}
        </span>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.note-stage {
  background:
    radial-gradient(ellipse 60% 50% at 50% 100%, rgb(255 255 255 / 0.04), transparent 70%),
    #000;
}

.stage-label-enter-active,
.stage-label-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.stage-label-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
.stage-label-leave-to {
  opacity: 0;
}
</style>