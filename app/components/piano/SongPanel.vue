<script setup lang="ts">
import { SONG_SPEEDS } from '~/composables/useSongPlayer'

// نوار بالای فضای مشکی: انتخاب آهنگ + پخش/توقف + سرعت + نوار پیشرفت
const { locale } = useI18n()
const { songs, song, songId, playing, speed, positionMs, play, pause, stop, select, setSpeed } = useSongPlayer()

const open = ref(false)

// متن‌ها فقط همین‌جا لازمن؛ برای زبانی که اینجا نیست انگلیسی نشون داده می‌شه
const TEXT = {
  fa: { songs: 'آهنگ‌ها', pick: 'یک آهنگ انتخاب کن', play: 'پخش', pause: 'توقف', stop: 'پایان', speed: 'سرعت', easy: 'آسان', medium: 'متوسط', hint: 'آهنگ پخش می‌شه و نت‌ها از بالا می‌آن؛ هم‌زمان با اون بنواز' },
  en: { songs: 'Songs', pick: 'Pick a song', play: 'Play', pause: 'Pause', stop: 'Stop', speed: 'Speed', easy: 'Easy', medium: 'Medium', hint: 'The song plays and the notes fall from above — play along' },
  fr: { songs: 'Morceaux', pick: 'Choisir un morceau', play: 'Lecture', pause: 'Pause', stop: 'Arrêter', speed: 'Vitesse', easy: 'Facile', medium: 'Moyen', hint: 'Le morceau joue et les notes tombent d’en haut : jouez avec' },
  tr: { songs: 'Şarkılar', pick: 'Bir şarkı seç', play: 'Çal', pause: 'Duraklat', stop: 'Durdur', speed: 'Hız', easy: 'Kolay', medium: 'Orta', hint: 'Şarkı çalar ve notalar yukarıdan düşer; onunla birlikte çal' },
} as const
type Lang = keyof typeof TEXT
const lang = computed<Lang>(() => (locale.value in TEXT ? (locale.value as Lang) : 'en'))
const ui = computed(() => TEXT[lang.value])

const title = (s: { title: Record<Lang, string> }) => s.title[lang.value]

const progress = computed(() => {
  const s = song.value
  if (!s) return 0
  return Math.min(1, Math.max(0, positionMs.value / s.durationMs))
})
// قبل از اولین نت (صبر برای رسیدن نت‌ها) نوار خالیه
const waiting = computed(() => playing.value && positionMs.value < 0)

function choose(id: string) {
  select(id)
  open.value = false
  play()
}

onBeforeUnmount(stop)
</script>

<template>
  <!-- mousedown.prevent: دکمه‌ها فوکوس نمی‌گیرن و کلیدهای کیبورد همچنان پیانو رو می‌زنن -->
  <div class="absolute inset-x-0 top-0 z-10 text-neutral-100" @mousedown.prevent>
    <!-- نوار پیشرفت -->
    <div class="h-0.5 w-full bg-white/10">
      <div
          class="h-full bg-teal-300 transition-[width] duration-100 ease-linear"
          :class="waiting ? 'opacity-40' : ''"
          :style="{ width: `${progress * 100}%` }"
      />
    </div>

    <div class="flex flex-wrap items-center gap-2 px-3 pt-2">
      <button
          type="button"
          class="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/10 transition-colors hover:bg-white/15"
          :class="open ? 'bg-white/20' : ''"
          :aria-expanded="open"
          @click="open = !open"
      >
        <svg class="size-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M8 3v9.3A3 3 0 1 0 10 15V6.6l6-1.5V10a3 3 0 1 0 2 2.8V2z" />
        </svg>
        {{ ui.songs }}
      </button>

      <template v-if="song">
        <span class="max-w-[12rem] truncate text-xs font-medium text-neutral-300 sm:max-w-xs" :title="title(song)">
          {{ title(song) }}
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
      </template>
    </div>

    <!-- لیست آهنگ‌ها -->
    <Transition name="songs-pop">
      <div
          v-if="open"
          class="mx-3 mt-2 max-h-64 w-80 max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl bg-neutral-900/95 p-1.5 shadow-xl ring-1 ring-white/10 backdrop-blur"
      >
        <p class="px-2 pb-1.5 pt-1 text-[11px] text-neutral-400">{{ ui.hint }}</p>
        <button
            v-for="s in songs"
            :key="s.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start transition-colors hover:bg-white/10"
            :class="songId === s.id ? 'bg-white/10' : ''"
            @click="choose(s.id)"
        >
          <span class="grid size-7 shrink-0 place-items-center rounded-full bg-teal-300/15 text-teal-300">
            <svg class="size-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6 3.5v13l11-6.5z" />
            </svg>
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm">{{ title(s) }}</span>
            <span class="block truncate text-[11px] text-neutral-400">{{ s.composer }}</span>
          </span>
          <span class="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-neutral-300">
            {{ s.level === 1 ? ui.easy : ui.medium }}
          </span>
        </button>
      </div>
    </Transition>

    <!-- راهنما وقتی آهنگ انتخاب نشده -->
    <p v-if="!song && !open" class="px-3 pt-2 text-[11px] text-neutral-500">{{ ui.pick }}</p>
  </div>
</template>

<style scoped>
.songs-pop-enter-active,
.songs-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.songs-pop-enter-from,
.songs-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>