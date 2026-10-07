<script setup lang="ts">
import type { PianoType } from '~/utils/pianoTypes'

const props = defineProps<{ type: PianoType }>()
const { active, status, noteOn, noteOff } = usePiano()
const { noteLabels } = useKeyBindings()

const keys = computed(() => buildKeys(props.type))
const whiteKeys = computed(() => keys.value.filter((k) => !k.isBlack))
const whiteWidth = computed(() => 100 / whiteKeys.value.length)
const BLACK_RATIO = 0.583
const blackWidth = computed(() => whiteWidth.value * BLACK_RATIO)

const BLACK_OFFSET: Record<string, number> = {
  'C#': -0.097,
  'D#': 0.097,
  'F#': -0.146,
  'G#': 0,
  'A#': 0.146,
}

// موقعیت هر کلید مشکی نسبت به کلیدهای سفید قبلی‌اش
const blackKeys = computed(() => {
  let whitesBefore = 0
  const result: { note: string; left: number; gap: number }[] = []
  for (const k of keys.value) {
    if (k.isBlack) {
      const offset = BLACK_OFFSET[k.note.replace(/-?\d+$/, '')] ?? 0
      result.push({
        note: k.note,
        left: (whitesBefore + offset) * whiteWidth.value - blackWidth.value / 2,
        gap: (0.5 - offset / BLACK_RATIO) * 100,
      })
    } else whitesBefore++
  }
  return result
})

// مرکز هر کلید به درصدِ عرض کیبورد (برای قرار دادن اسم نت بالای همون کلید)
const centers = computed(() => {
  const map: Record<string, number> = {}
  whiteKeys.value.forEach((k, i) => {
    map[k.note] = (i + 0.5) * whiteWidth.value
  })
  blackKeys.value.forEach((k) => {
    map[k.note] = k.left + blackWidth.value / 2
  })
  return map
})
const pressedNotes = computed(() => active.value.filter((n) => n in centers.value))

// فقط نت‌های داخل محدوده‌ی همین پیانو با کیبورد کامپیوتر نواخته می‌شن
const playable = computed(() => new Set(keys.value.map((k) => k.note)))
useKeyboardInput((note) => playable.value.has(note))

const isActive = (note: string) => active.value.includes(note)

// کلیدهای مشکی جدا و با تأخیر و سرعت تصادفی خودشون میان
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function riseStyle(seed: number) {
  return {
    animationDelay: `${Math.round(rand(seed + 1) * 800)}ms`,
    animationDuration: `${Math.round(900 + rand(seed + 101) * 600)}ms`,
  }
}

// کشیدن روی کلیدها (glissando): هر pointer (موس یا انگشت) نتی که الان زیرشه رو نگه می‌داره
const held = new Map<number, string | null>()

function noteAt(e: PointerEvent): string | null {
  const el = document.elementFromPoint(e.clientX, e.clientY)
  return el?.closest<HTMLElement>('[data-note]')?.dataset.note ?? null
}

function moveTo(id: number, note: string | null) {
  const prev = held.get(id) ?? null
  if (prev === note) return
  if (prev) noteOff(prev)
  if (note) noteOn(note)
  held.set(id, note)
}

function onDown(e: PointerEvent) {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  const el = e.currentTarget as HTMLElement
  el.focus({ preventScroll: true })
  el.setPointerCapture(e.pointerId)
  held.set(e.pointerId, null)
  moveTo(e.pointerId, noteAt(e))
}

function onMove(e: PointerEvent) {
  if (!held.has(e.pointerId)) return
  moveTo(e.pointerId, noteAt(e))
}

function onUp(e: PointerEvent) {
  if (!held.has(e.pointerId)) return
  moveTo(e.pointerId, null)
  held.delete(e.pointerId)
}

onBeforeUnmount(() => {
  for (const note of held.values()) if (note) noteOff(note)
  held.clear()
})
</script>

<template>
  <div class="flex flex-col shadow-[0_12px_30px_-12px_rgb(0_0_0/0.7)]">
    <!-- باکس نمایش نت‌های فشرده‌شده؛ بعد از لود صداها ظاهر می‌شه -->
    <div
        class="h-8 rounded-t-lg bg-black px-3 transition-opacity duration-500"
        :class="status === 'ready' ? 'opacity-100' : 'opacity-0'"
        aria-hidden="true"
    >
      <div class="relative h-full">
        <TransitionGroup name="note-label">
          <span
              v-for="n in pressedNotes"
              :key="n"
              class="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-semibold text-[#F5E6C8]"
              :style="{ left: `${centers[n]}%` }"
          >
            {{ n }}
          </span>
        </TransitionGroup>
      </div>
    </div>

    <!-- کل کیبورد توی عرض صفحه جا می‌شه و اسکرول افقی نداره -->
    <div
        class="keybed relative px-3 pb-4 pt-2 transition-[border-radius] duration-500"
        :class="status === 'ready' ? 'rounded-b-lg' : 'rounded-lg'"
    >
      <div class="cheek cheek-l" :class="status === 'ready' ? 'rounded-bl-lg' : 'rounded-l-lg'" />
      <div class="cheek cheek-r" :class="status === 'ready' ? 'rounded-br-lg' : 'rounded-r-lg'" />
      <div
          :key="type.keys"
          class="relative h-56 touch-none select-none sm:h-72"
          @pointerdown.prevent="onDown"
          @pointermove="onMove"
          @pointerup="onUp"
          @pointercancel="onUp"
      >
        <!-- کلیدهای سفید -->
        <div class="flex h-full">
          <button
              v-for="k in whiteKeys"
              :key="k.note"
              type="button"
              :aria-label="k.note"
              class="key-white flex min-w-0 flex-1 touch-none items-end justify-center overflow-hidden pb-3 text-[10px] font-medium text-stone-600 sm:text-xs"
              :class="{ 'is-active': isActive(k.note) }"
              :data-note="k.note"
          >
            {{ noteLabels[k.note] ?? '' }}
          </button>
        </div>

        <!-- نوار نمدی بالای کلیدها (زیر کلیدهای مشکی) -->
        <div class="felt pointer-events-none absolute inset-x-0 top-0" />

        <!-- کلیدهای مشکی -->
        <button
            v-for="(k, i) in blackKeys"
            :key="k.note"
            type="button"
            :aria-label="k.note"
            class="key-black key-rise absolute top-0 flex h-[63%] touch-none items-end justify-center overflow-hidden pb-[10%] text-[9px] font-medium text-stone-400 sm:text-[10px]"
            :class="{ 'is-active': isActive(k.note) }"
            :style="{ left: `${k.left}%`, width: `${blackWidth}%`, '--gap': `${k.gap}%`, ...riseStyle(i + 1000) }"
            :data-note="k.note"
        >
          {{ noteLabels[k.note] ?? '' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.keybed {
  --half-gap: 1px;
  background: linear-gradient(to bottom, #000 0%, #120a07 100%);
}

.felt {
  height: 4px;
  background: linear-gradient(to bottom, #2e0a0a, #4a1212);
}

/* دو طرف کلیدها: تکه‌های چوبی (cheek block) */
.cheek {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 12px;
}
.cheek-l {
  left: 0;
  background: linear-gradient(to right, #2b1a13, #120a07);
  box-shadow: inset -1px 0 0 rgb(255 255 255 / 0.07);
}
.cheek-r {
  right: 0;
  background: linear-gradient(to left, #2b1a13, #120a07);
  box-shadow: inset 1px 0 0 rgb(255 255 255 / 0.07);
}

/* کلیدهای سفید: سفید خنثی، فقط بالا زیر سایه‌ی نوار نمدی کمی خاکستری */
.key-white {
  margin-inline: var(--half-gap);
  border-radius: 0 0 4px 4px;
  background: linear-gradient(
      to bottom,
      #c9cdd1 0%,
      #e4e9ee 5%,
      #f2f5f8 20%,
      #f7f9fb 70%,
      #f0f3f6 100%
  );
  box-shadow:
      0 2px 2px rgb(0 0 0 / 0.45),
      inset 0 -2px 2px -1px rgb(0 0 0 / 0.1);
  transition: transform 60ms ease-out;
}
.key-white.is-active {
  background: linear-gradient(to bottom, #b98a22 0%, #e7b94f 8%, #f3cd72 40%, #f6d27f 100%);
  box-shadow: 0 0 2px rgb(0 0 0 / 0.5);
  transform: translateY(2px);
}

/* کلیدهای مشکی: بدنه‌ی سیاه براق، خط دور سیاه، سایه‌ی نرم روی کلیدهای سفید کنارش */
.key-black {
  border-radius: 0 0 3px 3px;
  background: linear-gradient(to bottom, #040404 0%, #0a0a0b 60%, #111112 100%);
  box-shadow:
      0 0 0 1px #000,
      -3px 1px 6px 0 rgb(0 0 0 / 0.26),
      2px 2px 5px -1px rgb(0 0 0 / 0.14);
  transition: transform 60ms ease-out;
}

/* قاب باریک و روشن‌تر داخل بدنه‌ی کلید (برق سطح) */
.key-black::before {
  content: '';
  position: absolute;
  inset: 0 13% 8% 13%;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-top: 0;
  border-radius: 0 0 10px 10px;
  background: linear-gradient(to bottom, transparent 50%, rgb(255 255 255 / 0.06));
}

/*
  پنجه‌ی کلید: سطح خاکستری براق + برق گوشه‌ی راست + یک سایه‌ی نرم و محو
  دقیقاً در موقعیت شکافِ واقعیِ بین کلیدهای سفید زیرین (--gap).
  به‌جای یه خط تیزِ قهوه‌ای، اینجا یه بیضیِ باریک و کم‌رنگِ مشکی‌ـ‌محو
  استفاده شده که بازتابِ طبیعیِ شکاف روی سطح لاکیِ کلید مشکی رو شبیه‌سازی می‌کنه.
*/
.key-black::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 8%;
  min-height: 8px;
  clip-path: polygon(0 100%, 0 30%, 12% 0, 88% 0, 100% 30%, 100% 100%);
  background:
      radial-gradient(ellipse 6% 90% at var(--gap) 55%, rgb(0 0 0 / 0.4), transparent 75%),
      radial-gradient(circle at 100% 0, rgb(255 255 255 / 0.7) 0, transparent 40%),
      linear-gradient(to bottom, #70757a, #4a4d4f);
}

.key-black.is-active {
  background: linear-gradient(to bottom, #8a6212 0%, #d79b21 40%, #c28a1a 100%);
  box-shadow:
      0 0 0 1px #5a3d08,
      -2px 1px 4px 0 rgb(0 0 0 / 0.3);
  transform: translateY(2px);
}
.key-black.is-active::before {
  border-color: rgb(255 255 255 / 0.25);
}
.key-black.is-active::after {
  background:
      radial-gradient(ellipse 6% 90% at var(--gap) 55%, rgb(50 30 2 / 0.4), transparent 75%),
      linear-gradient(to bottom, #f0c25a, #b98a22);
}

.key-rise {
  animation: key-rise 1.2s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes key-rise {
  from {
    transform: translateY(100vh);
  }
}

@media (prefers-reduced-motion: reduce) {
  .key-rise {
    animation: none;
  }
}

.note-label-enter-active,
.note-label-leave-active {
  transition: opacity 0.12s ease;
}
.note-label-enter-from,
.note-label-leave-to {
  opacity: 0;
}
</style>