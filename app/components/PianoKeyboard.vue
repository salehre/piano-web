<script setup lang="ts">
const { active, noteOn, noteOff } = usePiano()

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const START_OCTAVE = 3
const OCTAVES = 3

interface PianoKey {
  note: string
  isBlack: boolean
}

const keys: PianoKey[] = []
for (let o = START_OCTAVE; o < START_OCTAVE + OCTAVES; o++) {
  for (const n of NOTE_NAMES) keys.push({ note: `${n}${o}`, isBlack: n.includes('#') })
}
keys.push({ note: `C${START_OCTAVE + OCTAVES}`, isBlack: false })

const whiteKeys = keys.filter((k) => !k.isBlack)
const whiteWidth = 100 / whiteKeys.length
const blackWidth = whiteWidth * 0.6

// موقعیت هر کلید مشکی نسبت به کلیدهای سفید قبلی‌اش
const blackKeys = computed(() => {
  let whitesBefore = 0
  const result: { note: string; left: number }[] = []
  for (const k of keys) {
    if (k.isBlack) result.push({ note: k.note, left: whitesBefore * whiteWidth - blackWidth / 2 })
    else whitesBefore++
  }
  return result
})

// کیبورد کامپیوتر: ردیف وسط = کلیدهای سفید، ردیف بالا = کلیدهای مشکی
const KEY_MAP: Record<string, string> = {
  a: 'C4', w: 'C#4', s: 'D4', e: 'D#4', d: 'E4', f: 'F4', t: 'F#4',
  g: 'G4', y: 'G#4', h: 'A4', u: 'A#4', j: 'B4',
  k: 'C5', o: 'C#5', l: 'D5', p: 'D#5', ';': 'E5',
}
const NOTE_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, n]) => [n, k.toUpperCase()]),
)

function onKeyDown(e: KeyboardEvent) {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
  const note = KEY_MAP[e.key.toLowerCase()]
  if (note) noteOn(note)
}
function onKeyUp(e: KeyboardEvent) {
  const note = KEY_MAP[e.key.toLowerCase()]
  if (note) noteOff(note)
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

const isActive = (note: string) => active.value.includes(note)
</script>

<template>
  <div class="overflow-x-auto rounded-lg bg-stone-950 p-3 pb-4">
    <div class="relative h-56 min-w-[760px] select-none sm:h-72">
      <!-- کلیدهای سفید -->
      <div class="flex h-full">
        <button
          v-for="k in whiteKeys"
          :key="k.note"
          type="button"
          :aria-label="k.note"
          class="flex flex-1 touch-none items-end justify-center rounded-b-md border border-stone-400 pb-3 text-xs font-medium text-stone-500 transition-colors duration-75"
          :class="isActive(k.note) ? 'bg-key-active' : 'bg-stone-50'"
          @pointerdown.prevent="noteOn(k.note)"
          @pointerup="noteOff(k.note)"
          @pointerleave="noteOff(k.note)"
          @pointercancel="noteOff(k.note)"
        >
          {{ NOTE_LABEL[k.note] ?? '' }}
        </button>
      </div>

      <!-- کلیدهای مشکی -->
      <button
        v-for="k in blackKeys"
        :key="k.note"
        type="button"
        :aria-label="k.note"
        class="absolute top-0 flex h-[62%] touch-none items-end justify-center rounded-b-md pb-2 text-[10px] font-medium text-stone-400 transition-colors duration-75"
        :class="isActive(k.note) ? 'bg-key-active' : 'bg-stone-900'"
        :style="{ left: `${k.left}%`, width: `${blackWidth}%` }"
        @pointerdown.prevent="noteOn(k.note)"
        @pointerup="noteOff(k.note)"
        @pointerleave="noteOff(k.note)"
        @pointercancel="noteOff(k.note)"
      >
        {{ NOTE_LABEL[k.note] ?? '' }}
      </button>
    </div>
  </div>
</template>