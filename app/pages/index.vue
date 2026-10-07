<script setup lang="ts">
const { t } = useI18n()
// عنوان صفحه‌ی اصلی همون اسم برنامه است (titleTemplate توی app.vue)

const features = ['sound', 'play', 'shortcuts'] as const
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16 sm:py-24">
    <section class="flex flex-col items-start gap-6">
      <h1 class="text-4xl font-semibold tracking-tight sm:text-6xl">
        {{ t('home.hero.line1') }}<br class="hidden sm:block" />
        {{ t('home.hero.line2') }}
      </h1>
      <p class="max-w-xl text-lg text-stone-300">
        {{ t('home.hero.text') }}
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <NuxtLink
            to="/virtual-piano"
            class="rounded-lg bg-key-active px-5 py-3 font-medium text-stone-950 transition-opacity hover:opacity-90"
        >
          {{ t('home.hero.cta') }}
        </NuxtLink>
        <!-- <NuxtLink to="/settings" class="rounded-lg px-5 py-3 text-stone-200 transition-colors hover:text-key-active">
          Keyboard shortcuts
        </NuxtLink> -->
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-3">
      <div v-for="f in features" :key="f" class="glass-card relative p-6">
        <h2 class="font-medium">{{ t(`home.features.${f}.title`) }}</h2>
        <p class="mt-2 text-sm text-stone-400">{{ t(`home.features.${f}.text`) }}</p>
      </div>
    </section>

    <HomePianoFinder />

    <HomeFaq />

    <HomeBlogPreview />

    <!-- <section>
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
    </section> -->
  </main>
</template>
<style>
.a{
  scale: none;
}
</style>