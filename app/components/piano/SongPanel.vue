<script setup lang="ts">
import { SONG_SPEEDS } from '~/composables/useSongPlayer'

// نوار بالای فضای مشکی: نوار پیشرفت + پخش/توقف + سرعت.
// انتخاب آهنگ از دکمه‌ی «آهنگ‌ها» کنار سایز پیانو انجام می‌شه (LayoutSongsMenu).
const { ui, titleOf } = useSongText()
const { song, playing, speed, positionMs, play, pause, stop, setSpeed } = useSongPlayer()

const progress = computed(() => {
  const s = song.value
  if (!s) return 0
  return Math.min(1, Math.max(0, positionMs.value / s.durationMs))
})
// قبل از اولین نت (صبر برای رسیدن نت‌ها) نوار کم‌رنگه
const waiting = computed(() => playing.value && positionMs.value < 0)

onBeforeUnmount(stop)
</script>

<template>
  <!-- فقط وقتی آهنگ انتخاب شده -->
  <!-- mousedown.prevent: دکمه‌ها فوکوس نمی‌گیرن و کلیدهای کیبورد همچنان پیانو رو می‌زنن -->
  <div v-if="song" class="absolute inset-x-0 top-0 z-10 text-neutral-100" @mousedown.prevent>
    <!-- نوار پیشرفت -->
    <div class="h-0.5 w-full bg-white/10">
      <div
          class="h-full bg-teal-300 transition-[width] duration-100 ease-linear"
          :class="waiting ? 'opacity-40' : ''"
          :style="{ width: `${progress * 100}%` }"
      />
    </div>

    <div class="flex flex-wrap items-center gap-2 px-3 pt-2">
      <span class="max-w-[12rem] truncate text-xs font-medium text-neutral-300 sm:max-w-xs" :title="titleOf(song)">
        {{ titleOf(song) }}
      </span>

      <button
          type="button"
          class="grid size-8 place-items-center rounded-full bg-teal-300 text-neutral-950 transition-colors hover:bg-teal-200"
          :aria-label="playing ? ui.pause : ui.play"
          :title="playing ? ui.pause : ui.play"
          @click="playing ? pause() : play()"
      >
        <svg class="size-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path v-if="playing" d="M5 4h4v12H5zM11 4h4v12h-4z" />
          <path v-else d="M6 3.5v13l11-6.5z" />
        </svg>
      </button>

      <button
          type="button"
          class="grid size-8 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          :aria-label="ui.stop"
          :title="ui.stop"
          @click="stop"
      >
        <span class="size-3 rounded-sm bg-neutral-100" />
      </button>

      <!-- سرعت؛ فقط وقتی پخش نمی‌شه قابل تغییره -->
      <div dir="ltr" class="flex items-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/10" :title="ui.speed">
        <button
            v-for="v in SONG_SPEEDS"
            :key="v"
            type="button"
            class="px-2 py-1.5 text-[11px] font-medium tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            :class="speed === v ? 'bg-white/25 text-white' : 'text-neutral-300 hover:bg-white/10'"
            :disabled="playing"
            @click="setSpeed(v)"
        >
          {{ v }}×
        </button>
      </div>
    </div>
  </div>
</template>