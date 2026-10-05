<script setup lang="ts">
/** توست «گوشی رو بچرخونید»؛ فقط توی موبایلِ عمودی و فقط یک بار در هر نشست (تب) نشون داده می‌شه */
const STORAGE_KEY = 'rotate-toast-seen'
const AUTO_HIDE_MS = 7000

const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let portraitQuery: MediaQueryList | undefined

function isMobilePortrait() {
  return (
    window.matchMedia('(pointer: coarse)').matches &&
    window.matchMedia('(orientation: portrait)').matches &&
    window.innerWidth < 768
  )
}

function alreadySeen() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // sessionStorage در دسترس نیست (مثلاً حالت خصوصی)؛ مشکلی نیست
  }
}

function hide() {
  visible.value = false
  clearTimeout(timer)
}

// وقتی گوشی چرخید (حالت افقی شد) توست دیگه لازم نیست
function onOrientationChange(e: MediaQueryListEvent) {
  if (!e.matches) hide()
}

onMounted(() => {
  portraitQuery = window.matchMedia('(orientation: portrait)')
  portraitQuery.addEventListener('change', onOrientationChange)

  if (alreadySeen() || !isMobilePortrait()) return
  markSeen()
  visible.value = true
  timer = setTimeout(hide, AUTO_HIDE_MS)
})

onBeforeUnmount(() => {
  clearTimeout(timer)
  portraitQuery?.removeEventListener('change', onOrientationChange)
})
</script>

<template>
  <Transition
      enter-active-class="transition duration-300 ease-out motion-reduce:transition-none"
      enter-from-class="translate-y-4 opacity-0"
      leave-active-class="transition duration-200 ease-in motion-reduce:transition-none"
      leave-to-class="translate-y-4 opacity-0"
  >
    <div
        v-if="visible"
        class="fixed inset-x-4 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-stone-700 bg-stone-900/90 px-4 py-3 shadow-lg backdrop-blur"
        style="bottom: calc(1rem + env(safe-area-inset-bottom, 0px))"
        role="status"
        aria-live="polite"
    >
      <!-- آیکون چرخوندن گوشی -->
      <svg
          class="size-6 shrink-0 text-key-active"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
      >
        <rect x="8" y="2.5" width="8" height="13" rx="1.5" />
        <path d="M11.5 12.5h1" />
        <path d="M5 18.5a8 8 0 0 0 14 0" />
        <path d="m19 15 .2 3.6L15.6 18.4" />
      </svg>

      <p class="flex-1 text-sm text-stone-100">Rotate your phone for a better experience.</p>

      <button
          type="button"
          class="grid size-7 shrink-0 place-items-center rounded-full text-stone-400 transition-colors hover:text-key-active"
          aria-label="Dismiss"
          @click="hide"
      >
        <svg class="size-4" viewBox="0 0 20 20" aria-hidden="true">
          <path d="m5 5 10 10m0-10L5 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </Transition>
</template>