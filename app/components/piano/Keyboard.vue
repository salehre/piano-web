<script setup lang="ts">
import type { PianoType } from '~/utils/pianoTypes'

const props = defineProps<{ type: PianoType }>()
const { active, status, noteOn, noteOff } = usePiano()
const { noteLabels } = useKeyBindings()

const keys = computed(() => buildKeys(props.type))
const whiteKeys = computed(() => keys.value.filter((k) => !k.isBlack))
const whiteWidth = computed(() => 100 / whiteKeys.value.length)
const blackWidth = computed(() => whiteWidth.value * 0.6)

// موقعیت هر کلید مشکی نسبت به کلیدهای سفید قبلی‌اش
const blackKeys = computed(() => {
  let whitesBefore = 0
  const result: { note: string; left: number }[] = []
  for (const k of keys.value) {
    if (k.isBlack) result.push({ note: k.note, left: whitesBefore * whiteWidth.value - blackWidth.value / 2 })
    else whitesBefore++
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

// هر کلید جدا و با تأخیر و سرعت تصادفی خودش میاد
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
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
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
  <div class="flex flex-col gap-2">
    <!-- باکس نمایش نت‌های فشرده‌شده؛ بعد از لود صداها ظاهر می‌شه -->
    <div
        class="h-12 rounded-lg bg-black px-3 transition-opacity duration-500"
        :class="status === 'ready' ? 'opacity-100' : 'opacity-0'"
        aria-hidden="true"
    >
      <div class="relative h-full">
        <TransitionGroup name="note-label">
          <span
              v-for="n in pressedNotes"
              :key="n"
              class="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-semibold text-key-active"
              :style="{ left: `${centers[n]}%` }"
          >
            {{ n }}
          </span>
        </TransitionGroup>
      </div>
    </div>
  <div class="rounded-lg bg-stone-950 p-3 pb-4">
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
          class="flex min-w-0 flex-1 touch-none items-end justify-center overflow-hidden rounded-b border border-stone-400 pb-3 text-[10px] font-medium text-stone-500 transition-colors duration-75 sm:text-xs"
          :class="isActive(k.note) ? 'bg-key-active' : 'bg-stone-50'"
          :data-note="k.note"
        >
          {{ noteLabels[k.note] ?? '' }}
        </button>
      </div>

      <!-- کلیدهای مشکی -->
      <button
        v-for="(k, i) in blackKeys"
        :key="k.note"
        type="button"
        :aria-label="k.note"
        class="key-rise absolute top-0 flex h-[62%] touch-none items-end justify-center overflow-hidden rounded-b pb-2 text-[9px] font-medium text-stone-400 transition-colors duration-75 sm:text-[10px]"
        :class="isActive(k.note) ? 'bg-key-active' : 'bg-stone-900'"
        :style="{ left: `${k.left}%`, width: `${blackWidth}%`, ...riseStyle(i + 1000) }"
        :data-note="k.note"
      >
        {{ noteLabels[k.note] ?? '' }}
      </button>
    </div>
   </div>
  </div>
</template>

<style scoped>
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