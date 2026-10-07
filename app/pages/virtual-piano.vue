<script setup lang="ts">
const {
  status, init,
  recording, playing, saving, canDownload, recordedCount, timerMs,
  startRecording, stopRecording, play, stopPlayback, clearRecording, downloadRecording,
  volume, setVolume,
} = usePiano()
const { t, n } = useI18n()
const piano = usePianoType()

// آیکون بلندگو: قطع و وصل کردن صدا
let lastVolume = 0.8
function toggleMute() {
  if (volume.value > 0) {
    lastVolume = volume.value
    setVolume(0)
  } else {
    setVolume(lastVolume)
  }
}

// تایمر به‌صورت دقیقه:ثانیه.صدم‌ثانیه
const timer = computed(() => {
  const cs = Math.floor(timerMs.value / 10)
  const m = Math.floor(cs / 6000)
  const s = Math.floor((cs % 6000) / 100)
  const c = cs % 100
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(m)}:${pad(s)}.${pad(c)}`
})

// موقع رفتن به صفحه‌ی دیگه، ضبط و پخش متوقف می‌شه
onBeforeUnmount(() => {
  stopRecording()
  stopPlayback()
})

useHead({ title: () => t('piano.title', { keys: n(piano.value.keys) }) })
</script>

<template>
  <main class="mx-auto flex max-w-screen-2xl flex-col gap-6 px-6 py-8">
    <section class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">{{ t('piano.title', { keys: n(piano.keys) }) }}</h1>
        <p class="mt-1 text-stone-400">{{ t('piano.range', { from: piano.from, to: piano.to }) }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <LayoutPianoSizeMenu />

        <!-- نوار صدا همیشه چپ‌به‌راست (کم‌صدا → پرصدا) -->
        <div v-if="status === 'ready'" dir="ltr" class="flex items-center gap-2">
          <button
              type="button"
              class="grid size-8 place-items-center rounded-lg text-stone-300 transition-colors hover:text-key-active"
              :aria-label="volume > 0 ? t('piano.mute') : t('piano.unmute')"
              @click="toggleMute"
          >
            <svg class="size-4" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 8v4h3l4 3.5v-11L6 8H3z" fill="currentColor" />
              <path
                  v-if="volume === 0"
                  d="M13 8l4 4m0-4-4 4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
              />
              <template v-else>
                <path d="M13 7.5a3.5 3.5 0 0 1 0 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <path
                    v-if="volume > 0.5"
                    d="M15 5.5a6.5 6.5 0 0 1 0 9"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                />
              </template>
            </svg>
          </button>
          <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              :value="volume"
              class="h-1 w-24 cursor-pointer accent-key-active"
              :aria-label="t('piano.volume')"
              @input="setVolume(Number(($event.target as HTMLInputElement).value))"
          >
        </div>

        <button
            v-if="status !== 'ready'"
            type="button"
            class="rounded-md bg-key-active px-4 py-2 font-medium text-stone-950 disabled:opacity-60"
            :disabled="status === 'loading'"
            @click="init"
        >
          {{ status === 'loading' ? t('piano.loading') : status === 'error' ? t('piano.retry') : t('piano.loadPiano') }}
        </button>
      </div>
    </section>

    <!-- کیبورد پیانو توی صفحه‌ی راست‌به‌چپ هم باید چپ‌به‌راست بمونه (بم ← زیر) -->
    <div dir="ltr">
      <ClientOnly>
        <PianoKeyboard :type="piano" />
      </ClientOnly>
    </div>

    <!-- ضبط‌کننده: زیر پیانو -->
    <section v-if="status === 'ready'" dir="ltr" class="mr-auto flex w-fit items-stretch gap-2">
      <div class="glass-card relative flex h-14 items-center gap-2.5 rounded-2xl px-2.5 [--glass-radius:0.95rem]">
        <!-- ضبط -->
        <button
            type="button"
            class="grid size-9 shrink-0 place-items-center rounded-full bg-stone-800/70 transition-colors hover:bg-stone-800 disabled:opacity-40"
            :disabled="recording || playing || saving"
            :aria-label="t('piano.recorder.record')"
            @click="startRecording"
        >
          <span class="size-3 rounded-full bg-red-400" :class="recording ? 'animate-pulse' : ''" />
        </button>

        <!-- موقع ضبط: توقف؛ بعد از توقف: پخش -->
        <button
            v-if="recording"
            type="button"
            class="grid size-9 shrink-0 place-items-center rounded-full bg-stone-800/70 transition-colors hover:bg-stone-800"
            :aria-label="t('piano.recorder.stopRecording')"
            @click="stopRecording"
        >
          <span class="size-3 rounded-sm bg-stone-100" />
        </button>
        <button
            v-else
            type="button"
            class="grid size-9 shrink-0 place-items-center rounded-full bg-stone-800/70 transition-colors hover:bg-stone-800 disabled:opacity-40"
            :disabled="saving || recordedCount === 0"
            :aria-label="playing ? t('piano.recorder.stopPlayback') : t('piano.recorder.play')"
            @click="playing ? stopPlayback() : play()"
        >
          <svg class="size-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path v-if="playing" d="M5 4h4v12H5zM11 4h4v12h-4z" />
            <path v-else d="M6 3.5v13l11-6.5z" />
          </svg>
        </button>

        <!-- تایمر -->
        <span
            class="font-mono text-sm tabular-nums"
            :class="recording ? 'text-red-400' : playing ? 'text-key-active' : recordedCount > 0 ? 'text-stone-200' : 'text-stone-500'"
        >
          {{ timer }}
        </span>

        <!-- نمایشگر طیف صدا -->
        <PianoVisualizer dir="ltr" class="h-9 w-32 shrink-0" />
      </div>

      <!-- دانلود و پاک کردن: فقط آیکون، زیر هم -->
      <div v-if="recordedCount > 0 && !recording" class="flex h-14 flex-col gap-1">
        <button
            type="button"
            class="grid w-8 flex-1 place-items-center rounded-lg bg-stone-950/40 text-stone-300 transition-colors hover:text-key-active disabled:opacity-40"
            :disabled="saving || !canDownload"
            :aria-label="t('piano.recorder.download')"
            :title="t('piano.recorder.downloadShort')"
            @click="downloadRecording"
        >
          <svg class="size-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path d="M10 3v10m0 0-3.5-3.5M10 13l3.5-3.5M4 16h12" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button
            type="button"
            class="grid w-8 flex-1 place-items-center rounded-lg bg-stone-950/40 text-stone-300 transition-colors hover:text-key-active disabled:opacity-40"
            :disabled="saving"
            :aria-label="t('piano.recorder.clear')"
            :title="t('piano.recorder.clearShort')"
            @click="clearRecording"
        >
          <svg class="size-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path d="M5 5l10 10M15 5 5 15" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </section>
    <Transition name="loading-fade">
      <div
          v-if="status === 'loading'"
          class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-stone-950/40 backdrop-blur-md"
          role="status"
          aria-live="polite"
      >
        <div class="loader" />
        <span class="text-sm font-medium text-stone-200">{{ t('piano.loadingOverlay') }}</span>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.loader {
  width: 45px;
  aspect-ratio: 0.75;
  --c: no-repeat linear-gradient(var(--color-key-active, #e0a526) 0 0);
  background:
      var(--c) 0% 50%,
      var(--c) 50% 50%,
      var(--c) 100% 50%;
  animation: l7 1s infinite linear alternate;
}

@keyframes l7 {
  0% { background-size: 20% 50%, 20% 50%, 20% 50%; }
  20% { background-size: 20% 20%, 20% 50%, 20% 50%; }
  40% { background-size: 20% 100%, 20% 20%, 20% 50%; }
  60% { background-size: 20% 50%, 20% 100%, 20% 20%; }
  80% { background-size: 20% 50%, 20% 50%, 20% 100%; }
  100% { background-size: 20% 50%, 20% 50%, 20% 50%; }
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.2s ease;
}
.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>