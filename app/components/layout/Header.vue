<template>
  <header class="sticky top-0 z-40 border-b border-white/5 bg-stone-950/80 backdrop-blur-xl" data-cuelume-emphasis="subtle">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
      <NuxtLink to="/" class="text-lg font-semibold" data-cuelume-navigate>Web Piano</NuxtLink>

      <nav class="-mr-3 flex items-center gap-2" aria-label="Main">
        <NuxtLink
            to="/"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
            exact-active-class="text-key-active"
            data-cuelume-navigate
        >
          <svg class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M3 9.5 10 3l7 6.5M5 8.5V17h3.5v-4.5h3V17H15V8.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Home
        </NuxtLink>

        <NuxtLink
            to="/virtual-piano"
            class="rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
            active-class="text-key-active"
            data-cuelume-navigate
        >
          Virtual Piano
        </NuxtLink>

        <NuxtLink
            to="/blog"
            class="rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
            active-class="text-key-active"
            data-cuelume-navigate
        >
          Blog
        </NuxtLink>

        <NuxtLink
            to="/settings"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
            active-class="text-key-active"
            data-cuelume-navigate
        >
          <!--          <svg class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">-->
          <!--            <path d="M3 5h8M15 5h2M3 10h2M9 10h8M3 15h10M17 15h0" stroke-linecap="round" />-->
          <!--            <circle cx="13" cy="5" r="1.8" />-->
          <!--            <circle cx="7" cy="10" r="1.8" />-->
          <!--            <circle cx="15" cy="15" r="1.8" />-->
          <!--          </svg>-->
          Settings
        </NuxtLink>

        <LayoutUserMenu />
      </nav>
    </div>
  </header>
</template>