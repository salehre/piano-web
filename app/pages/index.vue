<script setup lang="ts">
const { status, init } = usePiano()
const piano = usePianoType()

useHead({ title: computed(() => `${piano.value.keys}-key piano | Web Piano`) })
</script>

<template>
  <main class="mx-auto flex max-w-screen-2xl flex-col gap-6 px-6 py-8">
    <section class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">{{ piano.keys }}-key piano</h1>
        <!-- <p class="mt-1 text-stone-400">Range {{ piano.from }} to {{ piano.to }}. {{ piano.description }}</p> -->
        <p class="mt-1 text-stone-400">Range {{ piano.from }} to {{ piano.to }}</p>
      </div>

      <button
        v-if="status !== 'ready'"
        type="button"
        class="rounded-md bg-key-active px-4 py-2 font-medium text-stone-950 disabled:opacity-60"
        :disabled="status === 'loading'"
        @click="init"
      >
        {{ status === 'loading' ? 'Loading sounds…' : status === 'error' ? 'Retry loading' : 'Load piano' }}
      </button>
      <span v-else class="text-sm text-stone-400">
        Ready. Click the keys or use your keyboard.
        <NuxtLink to="/settings" class="underline hover:text-stone-200">Change shortcuts</NuxtLink>
      </span>
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