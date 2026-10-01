<script setup lang="ts">
import type { PianoType } from '~/utils/pianoTypes'

const props = defineProps<{ type: PianoType }>()
const { active, noteOn, noteOff } = usePiano()
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

// فقط نت‌های داخل محدوده‌ی همین پیانو با کیبورد کامپیوتر نواخته می‌شن
const playable = computed(() => new Set(keys.value.map((k) => k.note)))
useKeyboardInput((note) => playable.value.has(note))

const isActive = (note: string) => active.value.includes(note)
</script>

<template>
  <!-- کل کیبورد توی عرض صفحه جا می‌شه و اسکرول افقی نداره -->
  <div class="rounded-lg bg-stone-950 p-3 pb-4">
    <div class="relative h-56 select-none sm:h-72">
      <!-- کلیدهای سفید -->
      <div class="flex h-full">
        <button
          v-for="k in whiteKeys"
          :key="k.note"
          type="button"
          :aria-label="k.note"
          class="flex min-w-0 flex-1 touch-none items-end justify-center overflow-hidden rounded-b border border-stone-400 pb-3 text-[10px] font-medium text-stone-500 transition-colors duration-75 sm:text-xs"
          :class="isActive(k.note) ? 'bg-key-active' : 'bg-stone-50'"
          @pointerdown.prevent="noteOn(k.note)"
          @pointerup="noteOff(k.note)"
          @pointerleave="noteOff(k.note)"
          @pointercancel="noteOff(k.note)"
        >
          {{ noteLabels[k.note] ?? '' }}
        </button>
      </div>

      <!-- کلیدهای مشکی -->
      <button
        v-for="k in blackKeys"
        :key="k.note"
        type="button"
        :aria-label="k.note"
        class="absolute top-0 flex h-[62%] touch-none items-end justify-center overflow-hidden rounded-b pb-2 text-[9px] font-medium text-stone-400 transition-colors duration-75 sm:text-[10px]"
        :class="isActive(k.note) ? 'bg-key-active' : 'bg-stone-900'"
        :style="{ left: `${k.left}%`, width: `${blackWidth}%` }"
        @pointerdown.prevent="noteOn(k.note)"
        @pointerup="noteOff(k.note)"
        @pointerleave="noteOff(k.note)"
        @pointercancel="noteOff(k.note)"
      >
        {{ noteLabels[k.note] ?? '' }}
      </button>
    </div>
  </div>
</template>