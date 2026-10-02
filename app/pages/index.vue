<script setup lang="ts">
useHead({ title: 'Web Piano' })

const features = [
  { title: 'Real piano sound', text: 'Recorded grand piano samples, loaded once and played instantly.' },
  { title: 'Play your way', text: 'Click, drag across the keys, touch the screen, or use your computer keyboard.' },
  { title: 'Your shortcuts', text: 'Map any note to any key and make the keyboard feel like yours.' },
]
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16 sm:py-24">
    <section class="flex flex-col items-start gap-6">
      <h1 class="text-4xl font-semibold tracking-tight sm:text-6xl">
        A piano that lives<br class="hidden sm:block" />
        in your browser
      </h1>
      <p class="max-w-xl text-lg text-stone-300">
        Play with real piano sounds using your mouse, touch screen, or computer keyboard. No install, no sign-up.
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <NuxtLink
            to="/virtual-piano"
            class="rounded-lg bg-key-active px-5 py-3 font-medium text-stone-950 transition-opacity hover:opacity-90"
        >
          Play virtual piano
        </NuxtLink>
        <NuxtLink to="/settings" class="rounded-lg px-5 py-3 text-stone-200 transition-colors hover:text-key-active">
          Keyboard shortcuts
        </NuxtLink>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-3">
      <div v-for="f in features" :key="f.title" class="rounded-2xl bg-stone-950/40 p-6">
        <h2 class="font-medium">{{ f.title }}</h2>
        <p class="mt-2 text-sm text-stone-400">{{ f.text }}</p>
      </div>
    </section>

    <section>
      <h2 class="text-sm font-medium uppercase tracking-wide text-stone-400">Pick a size</h2>
      <div class="mt-4 flex flex-wrap gap-2">
        <NuxtLink
            v-for="t in PIANO_TYPES"
            :key="t.keys"
            :to="{ path: '/virtual-piano', query: { keys: t.keys } }"
            class="rounded-full bg-stone-950/40 px-4 py-2 text-sm transition-colors hover:bg-stone-950/70 hover:text-key-active"
        >
          {{ t.keys }} keys
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
<style>
.a{
  scale: none;
}
</style>