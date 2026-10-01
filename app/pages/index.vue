<script setup lang="ts">
const { status, init } = usePiano()
const piano = usePianoType()

useHead({ title: computed(() => `${piano.value.keys}-key piano | Web Piano`) })
</script>

<template>
  <main class="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
    <section class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">{{ piano.keys }}-key piano</h1>
        <p class="mt-1 text-stone-400">Range {{ piano.from }} to {{ piano.to }}. {{ piano.description }}</p>
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
  </main>
</template>