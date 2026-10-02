<script setup lang="ts">
const {
  status, init,
  recording, playing, recordedCount, recordedMs,
  startRecording, stopRecording, play, stopPlayback, clearRecording,
} = usePiano()
const piano = usePianoType()

const duration = computed(() => {
  const s = Math.round(recordedMs.value / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

onBeforeUnmount(() => {
  stopRecording()
  stopPlayback()
})

useHead({ title: computed(() => `${piano.value.keys}-key piano | Web Piano`) })
</script>

<template>
  <main class="mx-auto flex max-w-screen-2xl flex-col gap-6 px-6 py-8">
    <section class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">{{ piano.keys }}-key piano</h1>
        <p class="mt-1 text-stone-400">Range {{ piano.from }} to {{ piano.to }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <LayoutPianoSizeMenu />

        <button
            v-if="status !== 'ready'"
            type="button"
            class="rounded-md bg-key-active px-4 py-2 font-medium text-stone-950 disabled:opacity-60"
            :disabled="status === 'loading'"
            @click="init"
        >
          {{ status === 'loading' ? 'Loading sounds…' : status === 'error' ? 'Retry loading' : 'Load piano' }}
        </button>

        <template v-else>
          <button
              type="button"
              class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active disabled:opacity-40"
              :class="recording ? 'text-red-400' : ''"
              :disabled="playing"
              @click="recording ? stopRecording() : startRecording()"
          >
            <span class="size-2.5 rounded-full bg-red-500" :class="recording ? 'animate-pulse' : ''" />
            {{ recording ? 'Stop' : 'Record' }}
          </button>
          <template v-if="recordedCount > 0 && !recording">
            <button
                type="button"
                class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
                @click="playing ? stopPlayback() : play()"
            >
              <svg class="size-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path v-if="playing" d="M5 4h4v12H5zM11 4h4v12h-4z" />
                <path v-else d="M6 3.5v13l11-6.5z" />
              </svg>
              {{ playing ? 'Stop' : 'Play' }}
              <span class="text-stone-400">{{ duration }}</span>
            </button>
            <button
                type="button"
                class="rounded-lg px-3 py-2 text-sm text-stone-400 transition-colors hover:text-key-active"
                @click="clearRecording"
            >
              Clear
            </button>
          </template>
          <span class="text-sm text-stone-400">
            Ready. Click the keys or use your keyboard.
            <NuxtLink to="/settings" class="underline hover:text-stone-200">Change shortcuts</NuxtLink></span>
        </template>
      </div>
    </section>

    <ClientOnly>
      <PianoKeyboard :type="piano" />
    </ClientOnly>
    
    <Transition name="loading-fade">
      <div
        v-if="status === 'loading'"
        class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-stone-950/40 backdrop-blur-md"
        role="status"
        aria-live="polite"
      >
        <div class="loader" />
        <span class="text-sm font-medium text-stone-200">Loading sounds…</span>
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