<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { t, te } = useI18n()
const HERO_IMAGE = '/images/1.png'

const highlights = [
  {
    id: 'touch',
    icon: '<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.5a6 6 0 0 1-4.7-2.3L4 15.5a1.6 1.6 0 0 1 2.4-2L9 15.5"/>',
  },
  {
    id: 'keyboard',
    icon: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M7 14h10"/>',
  },
  {
    id: 'midi',
    icon: '<circle cx="12" cy="12" r="9"/><path d="M7.5 12h.01M8.6 8.4h.01M12 7h.01M15.4 8.4h.01M16.5 12h.01M9 16.5h6"/>',
  },
  {
    id: 'install',
    icon: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="m9 10.5 2.2 2.2L15.5 8.5M8 21h8M12 17v4"/>',
  },
] as const

const heroSection = ref<HTMLElement | null>(null)

// reveal on scroll - سبک و بدون dependency
const vReveal = {
  mounted(el: HTMLElement, binding: any) {
    el.classList.add('reveal')
    if (binding?.value) {
      el.style.setProperty('--reveal-delay', typeof binding.value === 'number' ? `${binding.value}ms` : binding.value)
    }
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    io.observe(el)
  },
}

// پارالاکس لطیف هیرو با موس
onMounted(() => {
  const el = heroSection.value
  if (!el || typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!window.matchMedia('(pointer: fine)').matches) return

  let raf = 0
  const onMove = (e: MouseEvent) => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.setProperty('--mx', x.toFixed(3))
      el.style.setProperty('--my', y.toFixed(3))
    })
  }
  const onLeave = () => {
    el.style.setProperty('--mx', '0')
    el.style.setProperty('--my', '0')
  }
  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseleave', onLeave)
})
</script>

<template>
  <main class="overflow-clip">
    <section ref="heroSection" class="relative isolate overflow-hidden">
      <!-- بک‌گراند -->
      <div class="parallax-bg absolute inset-0 -z-20">
        <img
          :src="HERO_IMAGE"
          alt=""
          aria-hidden="true"
          fetchpriority="high"
          decoding="async"
          draggable="false"
          class="hero-zoom size-full scale-105 object-cover object-[70%_center] select-none"
        />
      </div>
      <div
        class="absolute inset-0 -z-10 bg-linear-to-r from-stone-950 via-stone-950/70 to-stone-950/10"
        aria-hidden="true"
      />
      <div
        class="absolute inset-0 -z-10 bg-linear-to-t from-stone-950 via-transparent to-stone-950/40"
        aria-hidden="true"
      />
      <!-- glow -->
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
        <div class="absolute -top-24 inset-s-[12%] size-72 rounded-full bg-key-active/20 blur-[110px]" />
        <div class="absolute top-1/3 -inset-e-20 size-80 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <!-- نت‌های شناور -->
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        <span class="float-note left-[10%] text-2xl text-key-active/40" style="animation-duration: 9s; animation-delay: 0s">♪</span>
        <span class="float-note left-[26%] text-lg text-white/30" style="animation-duration: 12s; animation-delay: 2.5s">♫</span>
        <span class="float-note left-[55%] text-xl text-key-active/30" style="animation-duration: 10s; animation-delay: 1.2s">♫</span>
        <span class="float-note left-[78%] text-3xl text-white/20" style="animation-duration: 13s; animation-delay: 4s">♪</span>
        <span class="float-note left-[88%] text-lg text-key-active/25" style="animation-duration: 11s; animation-delay: 0.8s">♩</span>
      </div>

      <div
        class="parallax-content relative z-10 mx-auto flex min-h-112 max-w-5xl flex-col justify-between gap-12 px-6 pt-14 pb-8 sm:pt-20 lg:min-h-[calc(80svh-3.75rem)]"
      >
        <div class="flex max-w-xl flex-col items-start gap-6">
          <!-- بج اختیاری، اگه ترجمه نداری خودش مخفی میمونه -->
          <div
            v-if="te('home.hero.badge')"
            class="hero-anim inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 py-1.5 ps-3 pe-3.5 text-xs font-medium text-stone-200 backdrop-blur-md"
            style="--d: 0ms"
          >
            <span class="relative flex size-2">
              <span class="absolute inline-flex size-full animate-ping rounded-full bg-key-active opacity-70" />
              <span class="relative inline-flex size-2 rounded-full bg-key-active" />
            </span>
            {{ t('home.hero.badge') }}
          </div>

          <h1 class="font-serif text-4xl leading-[1.1] font-medium text-balance text-white drop-shadow-sm sm:text-6xl">
            <span class="block overflow-hidden pb-1">
              <span class="hero-line" style="--d: 100ms">{{ t('home.hero.line1') }}</span>
            </span>
            <span class="block overflow-hidden pb-2">
              <span class="hero-line" style="--d: 210ms">{{ t('home.hero.line2') }}</span>
            </span>
          </h1>

          <p class="hero-anim max-w-md text-base leading-relaxed text-pretty text-stone-300 sm:text-lg" style="--d: 300ms">
            {{ t('home.hero.text') }}
          </p>

          <div class="hero-anim flex flex-wrap items-center gap-3" style="--d: 380ms">
            <NuxtLink
              to="/virtual-piano"
              data-cuelume-navigate
              class="btn-shine group inline-flex items-center gap-2.5 rounded-full bg-key-active px-7 py-3.5 font-medium text-stone-950 shadow-[0_10px_28px_-10px_var(--color-key-active)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_var(--color-key-active)] active:translate-y-0 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-key-active focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 focus-visible:outline-none"
            >
              {{ t('home.hero.cta') }}
              <svg class="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M4 10h12m-4.5-4.5L16 10l-4.5 4.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </NuxtLink>
          </div>
        </div>

        <ul class="glass-card hero-fade relative grid grid-cols-2 gap-x-2 gap-y-2 p-3 [--glass-radius:1.5rem] sm:gap-x-4 sm:gap-y-5 sm:p-5 lg:grid-cols-4 lg:p-6" style="--d: 450ms">
          <li
            v-for="(h, i) in highlights"
            :key="h.id"
            :style="{ '--d': `${520 + i * 110}ms` }"
            class="hero-anim group flex items-center gap-3 rounded-2xl p-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/6"
          >
            <span
              class="grid size-11 shrink-0 place-items-center rounded-xl border border-stone-700/50 bg-stone-950/40 text-key-active transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:border-key-active/50 group-hover:shadow-[0_0_22px_-6px_var(--color-key-active)]"
              aria-hidden="true"
            >
              <svg
                class="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                v-html="h.icon"
              />
            </span>
            <span class="min-w-0">
              <span class="block text-sm font-medium text-white">{{ t(`home.highlights.${h.id}.title`) }}</span>
              <span class="block truncate text-xs text-stone-400 sm:whitespace-normal">{{ t(`home.highlights.${h.id}.text`) }}</span>
            </span>
          </li>
        </ul>
      </div>
    </section>

    <div class="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16 sm:py-24">
      <section v-reveal id="finder" class="scroll-mt-24">
        <HomePianoFinder />
      </section>

      <div aria-hidden="true" class="h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

      <section v-reveal>
        <HomeFaq />
      </section>

      <section v-reveal>
        <HomeBlogPreview />
      </section>
    </div>
  </main>
</template>

<style scoped>
/* ورود هیرو */
.hero-anim {
  opacity: 0;
  animation: rise-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--d, 0ms);
  will-change: transform, opacity, filter;
}
.hero-fade {
  opacity: 0;
  animation: fade-in 1s ease forwards;
  animation-delay: var(--d, 0ms);
}
.hero-line {
  display: block;
  opacity: 0;
  transform: translateY(110%);
  filter: blur(8px);
  animation: line-up 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--d, 0ms);
  will-change: transform, opacity, filter;
}
.hero-zoom {
  animation: hero-zoom 8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  will-change: transform;
}

/* پارالاکس */
.parallax-bg {
  transform: translate3d(calc(var(--mx, 0) * 16px), calc(var(--my, 0) * 12px), 0);
  transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
.parallax-content {
  transform: translate3d(calc(var(--mx, 0) * -8px), calc(var(--my, 0) * -6px), 0);
  transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

/* دکمه براق */
.btn-shine {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.btn-shine::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.55) 50%, transparent 60%);
  transform: translateX(-130%);
  transition: transform 0.8s ease;
  pointer-events: none;
}
.btn-shine:hover::after {
  transform: translateX(130%);
}

/* نت شناور */
.float-note {
  position: absolute;
  bottom: 12%;
  opacity: 0;
  animation: float-up linear infinite;
  will-change: transform, opacity;
  filter: blur(0.2px);
}

/* اسکرول ریویل */
.reveal {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
  filter: blur(8px);
  transition:
    opacity 0.8s ease,
    transform 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.8s ease;
  transition-delay: var(--reveal-delay, 0ms);
  will-change: opacity, transform;
}
.reveal.is-visible {
  opacity: 1;
  transform: none;
  filter: none;
}

@keyframes rise-in {
  from { opacity: 0; transform: translateY(26px); filter: blur(10px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes line-up {
  from { opacity: 0; transform: translateY(110%); filter: blur(8px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@keyframes hero-zoom {
  from { transform: scale(1.15); }
  to { transform: scale(1.05); }
}
@keyframes float-up {
  0% { transform: translateY(20px) rotate(-8deg) scale(0.8); opacity: 0; }
  15% { opacity: 0.7; }
  70% { opacity: 0.45; }
  100% { transform: translateY(-340px) rotate(14deg) scale(1.1); opacity: 0; }
}
@keyframes nudge {
  0%, 100% { transform: translateY(-2px); }
  50% { transform: translateY(2px); }
}

@media (prefers-reduced-motion: reduce) {
  .hero-anim,
  .hero-fade,
  .hero-line,
  .hero-zoom,
  .float-note svg {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
  .parallax-bg,
  .parallax-content {
    transform: none !important;
  }
  .reveal {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    transition: none !important;
  }
  .btn-shine::after { display: none; }
}
</style>