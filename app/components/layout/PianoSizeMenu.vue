<script setup lang="ts">
const { t } = useI18n()
const piano = usePianoType()
const { cue } = useUiSounds()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const menuPosition = ref({ top: 0, left: 0 })

function updateMenuPosition() {
  if (!root.value || !menu.value) return

  const anchor = root.value.getBoundingClientRect()
  const bounds = menu.value.getBoundingClientRect()
  const padding = 8
  const maxLeft = window.innerWidth - bounds.width - padding
  const alignedLeft = getComputedStyle(root.value).direction === 'rtl'
    ? anchor.left
    : anchor.right - bounds.width
  const below = anchor.bottom + padding
  const maxTop = window.innerHeight - bounds.height - padding

  menuPosition.value = {
    left: Math.max(padding, Math.min(alignedLeft, maxLeft)),
    top: Math.max(padding, Math.min(below, maxTop)),
  }
}

function toggle() {
  open.value = !open.value
  cue(open.value ? 'open' : 'close', { emphasis: 'subtle' })
}
function closeMenu() {
  if (!open.value) return
  open.value = false
  cue('close', { emphasis: 'subtle' })
}
function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) closeMenu()
}
function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') closeMenu()
}

watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  updateMenuPosition()
})

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onEsc)
  window.addEventListener('resize', updateMenuPosition)
  window.addEventListener('scroll', updateMenuPosition, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onEsc)
  window.removeEventListener('resize', updateMenuPosition)
  window.removeEventListener('scroll', updateMenuPosition, true)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="toggle"
    >
      {{ t('piano.sizes') }}
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

    <Transition name="menu">
    <ul
      ref="menu"
      v-if="open"
      role="menu"
      :style="menuPosition"
      class="fixed z-50 w-[min(20rem,calc(100vw-1rem))] max-h-[calc(100dvh-1rem)] overflow-y-auto overflow-x-hidden rounded-xl bg-stone-900 shadow-2xl ring-1 ring-black/30"
    >
      <li v-for="p in PIANO_TYPES" :key="p.keys" role="none">
        <NuxtLink
          role="menuitem"
          :to="{ path: '/virtual-piano', query: { keys: p.keys } }"
          class="block px-4 py-3 hover:bg-stone-800"
          :class="p.keys === piano.keys ? 'bg-stone-800' : ''"
          data-cuelume-select
          data-cuelume-emphasis="subtle"
          @click="open = false"
        >
          <span class="flex items-baseline justify-between">
            <span class="font-medium">{{ $t('piano.keys', { n: $n(p.keys) }) }}</span>
            <span class="text-xs text-stone-400">{{ $t('piano.rangeShort', { from: p.from, to: p.to }) }}</span>
          </span>
          <!-- <span class="mt-0.5 block text-sm text-stone-400">{{ t.description }}</span> -->
        </NuxtLink>
      </li>
    </ul>
    </Transition>
  </div>
</template>

<style scoped>
.menu-enter-active {
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}
.menu-leave-active {
  transition: opacity 0.1s ease-in, transform 0.1s ease-in;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>