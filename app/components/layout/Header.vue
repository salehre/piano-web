<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <header class="sticky top-0 z-40 hidden border-b border-white/5 bg-stone-950/80 backdrop-blur-xl lg:block" data-cuelume-emphasis="subtle">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
      <NuxtLink to="/" class="flex items-center gap-2.5 text-lg font-semibold" data-cuelume-navigate>
        <svg class="size-7 text-key-active" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
          <path d="M22.5 16.0L30.0 16.0M21.6 19.2L25.5 21.5M19.2 21.6L23.0 28.1M16.0 22.5L16.0 27.0M12.8 21.6L9.0 28.1M10.4 19.2L6.5 21.5M9.5 16.0L2.0 16.0M10.4 12.8L6.5 10.5M12.7 10.4L9.0 3.9M16.0 9.5L16.0 5.0M19.2 10.4L23.0 3.9M21.6 12.7L25.5 10.5" />
        </svg>
        <span class="font-serif rtl:font-sans">{{ t('app.name') }}</span>
      </NuxtLink>

      <!-- فقط دسکتاپ؛ توی موبایل این گزینه‌ها توی داک پایین صفحه هستن (LayoutMobileDock) -->
      <nav class="hidden items-center gap-2 lg:flex" :aria-label="t('nav.main')">
        <NuxtLink
            to="/"
            class="relative rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active after:absolute after:inset-x-3 after:-bottom-px after:h-px after:scale-x-0 after:bg-key-active after:transition-transform"
            exact-active-class="text-key-active after:scale-x-100"
            data-cuelume-navigate
        >
          {{ t('nav.home') }}
        </NuxtLink>

        <NuxtLink
            to="/virtual-piano"
            class="relative rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active after:absolute after:inset-x-3 after:-bottom-px after:h-px after:scale-x-0 after:bg-key-active after:transition-transform"
            active-class="text-key-active after:scale-x-100"
            data-cuelume-navigate
        >
          {{ t('nav.virtualPiano') }}
        </NuxtLink>

        <!-- <NuxtLink
            to="/blog"
            class="rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
            active-class="text-key-active"
            data-cuelume-navigate
        >
          {{ t('nav.blog') }}
        </NuxtLink> -->

        <NuxtLink
            to="/settings"
            class="flex items-center gap-2 relative rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active after:absolute after:inset-x-3 after:-bottom-px after:h-px after:scale-x-0 after:bg-key-active after:transition-transform"
            active-class="text-key-active after:scale-x-100"
            data-cuelume-navigate
        >
          {{ t('nav.settings') }}
        </NuxtLink>

        <LayoutUserMenu />
      </nav>
    </div>
  </header>
</template>