<script setup lang="ts">
const { t } = useI18n()
const { isLoggedIn, initial } = useAuth()

const items = [
  { to: '/', label: 'nav.home', exact: true, icon: '<path d="M3 9.5 10 3l7 6.5V16a1 1 0 0 1-1 1h-3.5v-4.5h-5V17H4a1 1 0 0 1-1-1V9.5Z" stroke-linejoin="round"/>' },
  { to: '/virtual-piano', label: 'nav.virtualPiano', exact: false, icon: '<rect x="2.5" y="4" width="15" height="12" rx="1.5"/><path d="M7.5 4v12M12.5 4v12" stroke-linecap="round"/><path d="M6 4v6.5h3V4M11 4v6.5h3V4" fill="currentColor"/>' },
  { to: '/settings', label: 'nav.settings', exact: false, icon: '<path d="M9.3 2.8h1.4l.5 1.8a5.9 5.9 0 0 1 1.4.6l1.7-.9 1 1 1 1-.9 1.7c.3.4.5.9.6 1.4l1.8.5v1.4l-1.8.5a5.9 5.9 0 0 1-.6 1.4l.9 1.7-1 1-1 1-1.7-.9a5.9 5.9 0 0 1-1.4.6l-.5 1.8H9.3l-.5-1.8a5.9 5.9 0 0 1-1.4-.6l-1.7.9-1-1-1-1 .9-1.7a5.9 5.9 0 0 1-.6-1.4l-1.8-.5v-1.4l1.8-.5a5.9 5.9 0 0 1 .6-1.4l-.9-1.7 1-1 1-1 1.7.9a5.9 5.9 0 0 1 1.4-.6l.5-1.8Z"/><circle cx="10" cy="10" r="2.4"/>' },
]

const profileLabel = computed(() => (isLoggedIn.value ? t('nav.openProfile') : t('nav.loginOrSignup')))

const linkBase =
  'flex flex-1 flex-col items-center gap-1 rounded-3xl px-2 py-2 text-[11px] leading-none transition-colors hover:text-key-active focus:outline-none focus-visible:ring-2 focus-visible:ring-key-active/60'
</script>

<template>
  <nav
    class="fixed inset-x-4 z-40 mx-auto flex max-w-sm items-stretch gap-1 rounded-3xl border border-white/5 bg-stone-950/80 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden"
    style="bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px))"
    :aria-label="t('nav.dock')"
    data-cuelume-emphasis="subtle"
  >
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :class="linkBase"
      :active-class="item.exact ? '' : 'bg-stone-800 text-key-active'"
      :exact-active-class="item.exact ? 'bg-stone-800 text-key-active' : ''"
      data-cuelume-navigate
    >
      <svg class="size-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" v-html="item.icon" />
      <!-- <span>{{ t(item.label) }}</span> -->
    </NuxtLink>

    <NuxtLink
      to="/profile"
      :class="linkBase"
      active-class="bg-stone-800 text-key-active"
      :aria-label="profileLabel"
      :title="profileLabel"
      data-cuelume-navigate
    >
      <span
        v-if="isLoggedIn && initial"
        class="flex size-5 items-center justify-center rounded-full bg-key-active text-[11px] font-semibold text-stone-950"
        aria-hidden="true"
      >
        {{ initial }}
      </span>
      <svg v-else class="size-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <circle cx="10" cy="7" r="3" />
        <path d="M4 17c.8-3 3.2-4.5 6-4.5s5.2 1.5 6 4.5" stroke-linecap="round" />
      </svg>
      <!-- <span>{{ t('nav.profile') }}</span> -->
    </NuxtLink>
  </nav>
</template>