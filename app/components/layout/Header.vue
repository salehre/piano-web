<script setup lang="ts">
const piano = usePianoType()
</script>

<template>
  <header class="border-b border-stone-800 bg-stone-950">
    <div class="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-3">
      <NuxtLink :to="{ path: '/', query: { keys: piano.keys } }" class="text-lg font-semibold">
        Web Piano
      </NuxtLink>

      <nav class="flex items-center gap-2" aria-label="Main">
        <LayoutPianoSizeMenu />

        <NuxtLink
          to="/settings"
          class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
          active-class="text-key-active"
        >
          <svg class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M3 5h8M15 5h2M3 10h2M9 10h8M3 15h10M17 15h0" stroke-linecap="round" />
            <circle cx="13" cy="5" r="1.8" />
            <circle cx="7" cy="10" r="1.8" />
            <circle cx="15" cy="15" r="1.8" />
          </svg>
          Settings
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>