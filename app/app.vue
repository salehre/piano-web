<script setup lang="ts">
const { status, init } = usePiano()
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-6 p-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Web Piano</h1>

      <button
        v-if="status !== 'ready'"
        type="button"
        class="rounded-md bg-key-active px-4 py-2 font-medium text-stone-950 disabled:opacity-60"
        :disabled="status === 'loading'"
        @click="init"
      >
        {{ status === 'loading' ? 'Loading sounds…' : status === 'error' ? 'Retry loading' : 'Load piano' }}
      </button>
      <span v-else class="text-sm text-stone-400">Ready. Click the keys or use your keyboard (A S D F G H J K L).</span>
    </header>

    <ClientOnly>
      <PianoKeyboard />
    </ClientOnly>
  </main>
</template>