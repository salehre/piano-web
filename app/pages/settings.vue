<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { status: midiStatus, connect } = useMidi()

// آیکون هر بخش (viewBox 20×20)
const sections = [
  {
    id: 'general',
    icon: '<rect x="2.5" y="5" width="15" height="10" rx="2"/><path d="M5.5 8.5h.01M8.5 8.5h.01M11.5 8.5h.01M14.5 8.5h.01M6.5 11.5h7" stroke-linecap="round"/>',
  },
  {
    id: 'appearance',
    icon: '<path d="M10 2.5a7.5 7.5 0 1 0 0 15c1 0 1.6-.7 1.6-1.5 0-1.2-1-1.4-1-2.3 0-.8.7-1.2 1.5-1.2h1.6a3.3 3.3 0 0 0 3.3-3.3C17 5.5 13.9 2.5 10 2.5Z" stroke-linejoin="round"/><path d="M6.2 9.2h.01M8.4 6.2h.01M12 6.2h.01" stroke-linecap="round"/>',
  },
  {
    id: 'midi',
    icon: '<circle cx="10" cy="10" r="7.5"/><path d="M6.2 10h.01M7.4 6.9h.01M10 5.8h.01M12.6 6.9h.01M13.8 10h.01M7.5 13.5h5" stroke-linecap="round"/>',
  },
] as const

type SectionId = (typeof sections)[number]['id']

// بخش فعلی از آدرس: /settings/midi → midi
const current = computed<SectionId>(() => {
  const seg = route.path.split('/').filter(Boolean)[1]
  return sections.find((s) => s.id === seg)?.id ?? 'general'
})

// دکمه‌ی اتصال MIDI فقط وقتی لازمه که هنوز وصل نیستیم
const showConnect = computed(
  () => current.value === 'midi' && ['idle', 'error', 'denied'].includes(midiStatus.value),
)

useHead({ title: () => `${t(`settings.${current.value}.title`)} · ${t('settings.title')}` })
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-8">
    <!-- سربرگ بخش فعلی -->
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <h1 class="text-2xl font-semibold">{{ t(`settings.${current}.title`) }}</h1>
        <p class="mt-1 text-sm text-stone-400">{{ t(`settings.${current}.description`) }}</p>
      </div>

      <button
        v-if="showConnect"
        type="button"
        class="rounded-xl bg-key-active px-5 py-2.5 text-sm font-semibold text-stone-950 transition-opacity hover:opacity-90"
        data-cuelume-emphasis="strong"
        @click="connect"
      >
        {{ midiStatus === 'error' || midiStatus === 'denied' ? t('settings.midi.tryAgain') : t('settings.midi.connect') }}
      </button>
    </header>

    <div class="mt-6 flex flex-col gap-6 md:flex-row md:gap-8">
      <!-- سایدبار: توی موبایل افقی، توی دسکتاپ کنار صفحه -->
      <nav
        class="flex shrink-0 gap-1 overflow-x-auto md:sticky md:top-20 md:w-52 md:flex-col md:self-start md:overflow-visible md:border-e md:border-stone-700/40 md:pe-4"
        :aria-label="t('settings.title')"
      >
        <NuxtLink
          v-for="s in sections"
          :key="s.id"
          :to="`/settings/${s.id}`"
          class="flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors hover:bg-stone-800/40 hover:text-key-active focus:outline-none focus-visible:ring-2 focus-visible:ring-key-active/60"
          :class="current === s.id ? 'bg-stone-800/70 text-key-active' : 'text-stone-300'"
          data-cuelume-tap
          data-cuelume-emphasis="subtle"
        >
          <svg class="size-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" v-html="s.icon" />
          {{ t(`settings.nav.${s.id}`) }}
        </NuxtLink>
      </nav>

      <!-- محتوای بخش -->
      <section class="min-w-0 flex-1">
        <NuxtPage />
      </section>
    </div>
  </main>
</template>
