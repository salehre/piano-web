<script setup lang="ts">
const { t } = useI18n()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

function closeMenu() {
  open.value = false
}

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) closeMenu()
}

function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') closeMenu()
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onEsc)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onEsc)
})
</script>

<template>
  <header ref="root" class="sticky top-0 z-40 border-b border-white/5 bg-stone-950/80 backdrop-blur-xl" data-cuelume-emphasis="subtle">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
      <NuxtLink to="/" class="text-lg font-semibold" data-cuelume-navigate>{{ t('app.name') }}</NuxtLink>

      <button
          type="button"
          class="grid size-10 place-items-center rounded-lg text-stone-300 transition-colors hover:text-key-active lg:hidden"
          :aria-label="t('nav.main')"
          aria-controls="main-navigation"
          :aria-expanded="open"
          @click="open = !open"
      >
        <svg v-if="!open" class="size-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <path d="M3 5h14M3 10h14M3 15h14" stroke-linecap="round" />
        </svg>
        <svg v-else class="size-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <path d="m5 5 10 10M15 5 5 15" stroke-linecap="round" />
        </svg>
      </button>

      <nav
          id="main-navigation"
          class="absolute inset-x-4 top-full z-50 flex-col gap-1 rounded-xl border border-white/10 bg-stone-950 p-3 shadow-2xl lg:static lg:flex lg:flex-row lg:items-center lg:gap-2 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
          :class="open ? 'flex' : 'hidden lg:flex'"
          :aria-label="t('nav.main')"
          @click="closeMenu"
      >
        <NuxtLink
            to="/"
            class="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-stone-800 hover:text-key-active lg:hover:bg-transparent"
            exact-active-class="text-key-active"
            data-cuelume-navigate
        >
          {{ t('nav.home') }}
        </NuxtLink>

        <NuxtLink
            to="/virtual-piano"
            class="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-stone-800 hover:text-key-active lg:hover:bg-transparent"
            active-class="text-key-active"
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
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-stone-800 hover:text-key-active lg:hover:bg-transparent"
            active-class="text-key-active"
            data-cuelume-navigate
        >
          {{ t('nav.settings') }}
        </NuxtLink>

        <LayoutLanguageSwitcher />
        <LayoutThemeSwitcher />
        <LayoutUserMenu />
      </nav>
    </div>
  </header>
</template>
