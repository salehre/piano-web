<script setup lang="ts">
const { t } = useI18n()
const { isLight } = useTheme()
const route = useRoute()

const rays = [
  'M22.5 16.0L30.0 16.0', 'M21.6 19.2L25.5 21.5', 'M19.2 21.6L23.0 28.1',
  'M16.0 22.5L16.0 27.0', 'M12.8 21.6L9.0 28.1',  'M10.4 19.2L6.5 21.5',
  'M9.5 16.0L2.0 16.0',   'M10.4 12.8L6.5 10.5',  'M12.7 10.4L9.0 3.9',
  'M16.0 9.5L16.0 5.0',   'M19.2 10.4L23.0 3.9',  'M21.6 12.7L25.5 10.5',
]

const navEl = ref<HTMLElement | null>(null)
const scrolled = ref(false)
const progress = ref(0)

// خط شناور زیر آیتم‌ها
const ink = reactive({ x: 0, w: 0, on: false })

function moveTo(el: HTMLElement | null) {
  if (!el || !navEl.value) {
    ink.on = false
    return
  }
  // خط رو کمی از دو طرف داخل‌تر میذاریم تا فقط زیر متن باشه، نه کل دکمه
  const inset = 14
  ink.x = el.offsetLeft + inset
  ink.w = Math.max(el.offsetWidth - inset * 2, 20)
  ink.on = true
}

function syncInk() {
  moveTo(navEl.value?.querySelector<HTMLElement>('.nav-active') ?? null)
}

const onEnter = (e: MouseEvent) => moveTo(e.currentTarget as HTMLElement)

// حداکثر یک بار در هر فریم محاسبه می‌شه (scroll خیلی بیشتر از فریم رویداد می‌ده)
let scrollRaf = 0
function readScroll() {
  scrollRaf = 0
  const y = window.scrollY
  scrolled.value = y > 8
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(y / max, 1) : 0
}
function onScroll() {
  if (!scrollRaf) scrollRaf = requestAnimationFrame(readScroll)
}

let ro: ResizeObserver | undefined
onMounted(async () => {
  await nextTick()
  syncInk()
  readScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', syncInk)
  if (navEl.value) {
    ro = new ResizeObserver(() => syncInk())
    ro.observe(navEl.value)
  }
})
onBeforeUnmount(() => {
  cancelAnimationFrame(scrollRaf)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', syncInk)
  ro?.disconnect()
})
watch(() => route.fullPath, () => nextTick(syncInk))
</script>

<template>
  <header
    class="site-header sticky top-0 z-40 hidden lg:block border-b transition-all duration-500"
    :class="[
      scrolled
        ? 'border-white/10 bg-stone-950/75 shadow-[0_10px_40px_-20px_rgba(0,0,0,.9)] backdrop-blur-xl'
        : 'border-white/5 bg-stone-950/50 backdrop-blur-md',
      { 'theme-light': isLight },
    ]"
  >
    <div
      class="relative mx-auto flex max-w-5xl items-center justify-between px-6 transition-[padding] duration-500"
      :class="scrolled ? 'py-2' : 'py-3.5'"
    >
      <!-- Logo -->
      <NuxtLink to="/" class="group relative flex items-center gap-3 text-lg font-semibold outline-none">
        <span class="relative grid size-9 place-items-center rounded-xl transition-colors duration-300 group-hover:bg-white/6">
          <span class="absolute inset-0 -z-10 rounded-xl bg-key-active/25 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
          <svg
            class="logo size-7 text-key-active transition-transform duration-900 ease-[cubic-bezier(.22,1,.36,1)] group-hover:rotate-180"
            viewBox="0 0 32 32" fill="none" stroke="currentColor"
            stroke-width="1.6" stroke-linecap="round" aria-hidden="true"
          >
            <path v-for="(d, i) in rays" :key="i" :d="d" class="ray" :style="{ animationDelay: `${i * 110}ms` }" />
          </svg>
        </span>
        <span class="font-serif tracking-wide bg-linear-to-b from-stone-50 to-stone-400 bg-clip-text text-transparent">
          {{ t('app.name') }}
        </span>
      </NuxtLink>

      <!-- Nav -->
      <nav ref="navEl" class="relative flex items-center gap-1" :aria-label="t('nav.main')" @mouseleave="syncInk">
        <!-- خط شناور -->
        <span
          class="nav-ink text-key-active"
          :style="{ transform: `translateX(${ink.x}px)`, width: `${ink.w}px`, opacity: ink.on ? 1 : 0 }"
        >
          <span class="nav-ink-glow" />
          <span class="nav-ink-core" />
        </span>

        <NuxtLink to="/" exact-active-class="nav-active" class="nav-link" @mouseenter="onEnter">
          {{ t('nav.home') }}
        </NuxtLink>

        <NuxtLink to="/virtual-piano" active-class="nav-active" class="nav-link" @mouseenter="onEnter">
          {{ t('nav.virtualPiano') }}
        </NuxtLink>

        <NuxtLink to="/settings" active-class="nav-active" class="nav-link group/s" @mouseenter="onEnter">
          {{ t('nav.settings') }}
        </NuxtLink>

        <span class="mx-2 h-5 w-px bg-linear-to-b from-transparent via-white/15 to-transparent" />

        <!-- وقتی موس میره روی یوزرمنو، خط برمیگرده سرجای اکتیو -->
        <div @mouseenter="syncInk">
          <LayoutUserMenu />
        </div>
      </nav>
    </div>

    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-linear-to-r from-key-active/0 via-key-active to-key-active/0"
      :style="{ transform: `scaleX(${progress})` }"
    />
  </header>
</template>

<style scoped>
.site-header { animation: headerIn .7s cubic-bezier(.22,1,.36,1) both; }
@keyframes headerIn {
  from { opacity: 0; transform: translateY(-18px); }
  to { opacity: 1; transform: translateY(0); }
}

/* لینک‌ها: فقط رنگ + لیفت، بدون بکگراند */
.nav-link {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .55rem .85rem .7rem;
  font-size: .875rem;
  color: rgb(214 211 209 / .75);
  background: transparent !important;
  transition: color .25s ease, transform .35s cubic-bezier(.22,1,.36,1), opacity .25s ease;
}
.nav-link:hover {
  color: #fff;
  transform: translateY(-1px);
}
.nav-link.nav-active {
  color: var(--color-key-active, #fff);
}

.site-header.theme-light {
  color: #24140e;
}
.site-header.theme-light .nav-link {
  color: #6f523c;
}
.site-header.theme-light .nav-link:hover {
  color: #24140e;
}
.site-header.theme-light nav:hover .nav-link:not(:hover):not(.nav-active) {
  opacity: 1;
}

/* وقتی روی ناو هاوری، بقیه کم‌رنگ میشن تا فوکوس بره روی هاور شده */
nav:hover .nav-link:not(:hover):not(.nav-active) {
  opacity: .55;
}

/* خط شناور */
.nav-ink {
  position: absolute;
  bottom: 1px;
  left: 0;
  height: 2px;
  pointer-events: none;
  transition:
    transform .55s cubic-bezier(.34,1.3,.64,1),
    width .55s cubic-bezier(.34,1.3,.64,1),
    opacity .3s ease;
  will-change: transform, width;
}
.nav-ink-core {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 12px currentColor, 0 0 4px currentColor;
}
.nav-ink-glow {
  position: absolute;
  inset: -6px -10px;
  border-radius: 999px;
  background: currentColor;
  opacity: .18;
  filter: blur(8px);
}

/* پرتوهای لوگو */
.ray { opacity: .45; animation: rayPulse 3.2s ease-in-out infinite; }
@keyframes rayPulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
.logo { filter: drop-shadow(0 0 6px color-mix(in srgb, currentColor 35%, transparent)); }

@media (prefers-reduced-motion: reduce) {
  .site-header, .ray, .logo, .nav-link, .nav-ink { animation: none !important; transition: none !important; }
}
</style>