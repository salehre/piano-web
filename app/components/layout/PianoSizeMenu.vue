<script setup lang="ts">
const piano = usePianoType()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
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
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex items-center gap-2 rounded-md border border-stone-700 px-3 py-2 text-sm hover:bg-stone-800"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="open = !open"
    >
      Piano sizes
      <span class="text-stone-400">{{ piano.keys }} keys</span>
      <svg
        class="size-4 text-stone-400 transition-transform"
        :class="open ? 'rotate-180' : ''"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
      </svg>
    </button>

    <ul
      v-if="open"
      role="menu"
      class="absolute right-0 z-10 mt-2 w-80 overflow-hidden rounded-lg border border-stone-700 bg-stone-900 shadow-xl"
    >
      <li v-for="t in PIANO_TYPES" :key="t.keys" role="none">
        <NuxtLink
          role="menuitem"
          :to="{ path: '/', query: { keys: t.keys } }"
          class="block px-4 py-3 hover:bg-stone-800"
          :class="t.keys === piano.keys ? 'bg-stone-800' : ''"
          @click="open = false"
        >
          <span class="flex items-baseline justify-between">
            <span class="font-medium">{{ t.keys }} keys</span>
            <span class="text-xs text-stone-400">{{ t.from }} to {{ t.to }}</span>
          </span>
          <span class="mt-0.5 block text-sm text-stone-400">{{ t.description }}</span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>