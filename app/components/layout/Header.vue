<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-white/5 bg-stone-950/80 backdrop-blur-xl" data-cuelume-emphasis="subtle">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
      <NuxtLink to="/" class="text-lg font-semibold" data-cuelume-navigate>{{ t('app.name') }}</NuxtLink>

      <nav class="-me-3 flex items-center gap-2" :aria-label="t('nav.main')">
        <NuxtLink
            to="/"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
            exact-active-class="text-key-active"
            data-cuelume-navigate
        >
          <svg class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M3 9.5 10 3l7 6.5M5 8.5V17h3.5v-4.5h3V17H15V8.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ t('nav.home') }}
        </NuxtLink>

        <NuxtLink
            to="/virtual-piano"
            class="rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
            active-class="text-key-active"
            data-cuelume-navigate
        >
          {{ t('nav.virtualPiano') }}
        </NuxtLink>

        <NuxtLink
            to="/blog"
            class="rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
            active-class="text-key-active"
            data-cuelume-navigate
        >
          {{ t('nav.blog') }}
        </NuxtLink>

        <NuxtLink
            to="/settings"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
            active-class="text-key-active"
            data-cuelume-navigate
        >
          {{ t('nav.settings') }}
        </NuxtLink>

        <LayoutLanguageSwitcher />
        <LayoutUserMenu />
      </nav>
    </div>
  </header>
</template>
