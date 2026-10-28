<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'

const { t, locale, locales, setLocale } = useI18n()
const { theme, setTheme } = useTheme()

const langs = computed(() => (locales.value as LocaleObject[]).map((l) => ({ code: l.code, language: l.language })))

const previews: Record<Theme, { bg: string; border: string; text: string; sub: string; glow: string; panel: string }> = {
  navy: {
    bg: 'linear-gradient(160deg, #0f1c33, #070d1a)',
    border: 'rgba(148, 169, 196, 0.25)',
    text: '#e6ecf5',
    sub: '#94a9c4',
    glow: 'rgba(70, 110, 180, 0.4)',
    panel: 'rgba(148, 169, 196, 0.1)',
  },
  dark: {
    bg: 'linear-gradient(160deg, #2a160c, #170c07)',
    border: 'rgba(196, 169, 138, 0.25)',
    text: '#f4ebdd',
    sub: '#c4a98a',
    glow: 'rgba(226, 117, 47, 0.35)',
    panel: 'rgba(196, 169, 138, 0.1)',
  },
  wine: {
    bg: 'linear-gradient(160deg, #3a0f1c, #1c060d)',
    border: 'rgba(197, 139, 151, 0.25)',
    text: '#f6e4e7',
    sub: '#c58b97',
    glow: 'rgba(190, 40, 70, 0.4)',
    panel: 'rgba(197, 139, 151, 0.1)',
  },
  light: {
    bg: 'linear-gradient(160deg, #fbf3e2, #e9d6b3)',
    border: 'rgba(74, 44, 29, 0.2)',
    text: '#24140e',
    sub: '#6f523c',
    glow: 'rgba(255, 255, 255, 0.85)',
    panel: 'rgba(74, 44, 29, 0.08)',
  },
}

const WHITE_KEYS = 14
const BLACK_AFTER = new Set([0, 1, 3, 4, 5])
const blackKeys = Array.from({ length: WHITE_KEYS - 1 }, (_, i) => i).filter((i) => BLACK_AFTER.has(i % 7))

// آرپژ آروم؛ فقط همین کلیدها «نواخته» می‌شن
const WHITE_PHRASE = [0, 2, 4, 7, 9, 7, 4, 5, 9, 12, 11, 7, 4, 0]
const BLACK_PHRASE = [1, 4, 8, 11, 8, 4]

function playDelay(index: number, phrase: number[]) {
  const at = phrase.indexOf(index)
  return at === -1 ? undefined : `${at * 0.16}s`
}

const base =
  'lang-btn flex min-w-28 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-key-active/60'
const on = 'border-key-active bg-key-active text-stone-950 scale-[1.03]'
const off = 'border-stone-700/60 bg-stone-950/30 text-stone-200 hover:bg-stone-800/60'
</script>

<template>
  <div class="space-y-4">
    <section class="rounded-2xl border border-stone-700/40 bg-stone-950/30 p-5" role="radiogroup" :aria-label="t('settings.appearance.language')">
      <h3 class="text-sm font-medium">{{ t('settings.appearance.language') }}</h3>
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="(l, i) in langs"
          :key="l.code"
          type="button"
          role="radio"
          :aria-checked="locale === l.code"
          :lang="l.language"
          :class="[base, locale === l.code ? on : off]"
          :style="{ animationDelay: `${i * 50}ms` }"
          data-cuelume-tap
          data-cuelume-emphasis="subtle"
          @click="setLocale(l.code)"
        >
          {{ t(`settings.appearance.languages.${l.code}`) }}
        </button>
      </div>
    </section>

    <section class="rounded-2xl border border-stone-700/40 bg-stone-950/30 p-5" role="radiogroup" :aria-label="t('settings.appearance.theme')">
      <h3 class="text-sm font-medium">{{ t('settings.appearance.theme') }}</h3>

      <div class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <button
          v-for="(th, ti) in THEMES"
          :key="th"
          type="button"
          role="radio"
          :aria-checked="theme === th"
          class="theme-card relative flex flex-col overflow-hidden rounded-2xl border p-3 text-start transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-key-active/60"
          :class="theme === th ? 'is-on border-key-active shadow-[0_0_24px_-8px_var(--color-key-active)]' : 'hover:-translate-y-0.5'"
          :style="{
            background: previews[th].bg,
            color: previews[th].text,
            animationDelay: `${ti * 70}ms`,
            ...(theme === th ? {} : { borderColor: previews[th].border }),
          }"
          data-cuelume-tap
          data-cuelume-emphasis="subtle"
          @click="setTheme(th)"
        >
          <span
            v-if="theme === th"
            class="check-pop absolute end-2.5 top-2.5 z-10 grid size-5 place-items-center rounded-full bg-key-active text-stone-950"
            aria-hidden="true"
          >
            <svg class="size-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.6">
              <path d="m5 10.5 3.5 3.5L15 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>

          <div
            class="relative isolate aspect-4/3 overflow-hidden rounded-xl border"
            :style="{
              borderColor: previews[th].border,
              boxShadow: `inset 0 0 36px 8px ${previews[th].glow}`,
            }"
            aria-hidden="true"
          >
            <div
              class="preview-haze absolute -inset-3 -z-10 rounded-2xl blur-[3px]"
              :style="{
                backgroundImage: `linear-gradient(${previews[th].glow}, ${previews[th].glow}), url('/images/theme-bg.webp')`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }"
            />
            <div
              class="preview-photo absolute inset-0 z-0 rounded-[inherit]"
              :style="{
                backgroundImage: `linear-gradient(${previews[th].glow}, ${previews[th].glow}), url('/images/theme-bg.webp')`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }"
            />

            <div
              class="pointer-events-none absolute inset-x-2.5 bottom-2 z-10 h-[38%]"
              dir="ltr"
            >
              <div
                class="pointer-events-none absolute -inset-x-2 -top-6 bottom-0 -z-10"
                :style="{ background: `linear-gradient(to top, ${previews[th].bg.includes('#070d1a') ? '#070d1a' : 'rgba(0,0,0,0.28)'}, transparent)` }"
              />
              <div class="flex h-full items-end gap-px">
                <span
                  v-for="i in WHITE_KEYS"
                  :key="i"
                  class="piano-white"
                  :class="{ 'is-played': playDelay(i - 1, WHITE_PHRASE) }"
                  :style="{ animationDelay: playDelay(i - 1, WHITE_PHRASE), '--glow': previews[th].glow }"
                />
              </div>
              <span
                v-for="i in blackKeys"
                :key="'b' + i"
                class="piano-black"
                :class="{ 'is-played': playDelay(i, BLACK_PHRASE) }"
                :style="{
                  left: `calc(${((i + 1) / WHITE_KEYS) * 100}% - 3.1%)`,
                  animationDelay: playDelay(i, BLACK_PHRASE),
                  '--glow': previews[th].glow,
                }"
              />
            </div>
          </div>

          <span class="mt-3 flex items-center gap-2 text-sm font-semibold">
            {{ t(`settings.appearance.themes.${th}.name`) }}
            <span v-if="theme === th" class="ms-auto flex h-3 items-end gap-0.5" aria-hidden="true">
              <i v-for="n in 3" :key="n" class="eq-bar" :style="{ animationDelay: `${(n - 1) * 0.12}s`, background: previews[th].sub }" />
            </span>
          </span>
          <span class="mt-0.5 text-xs" :style="{ color: previews[th].sub }">{{ t(`settings.appearance.themes.${th}.description`) }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lang-btn,
.theme-card {
  animation: card-in 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

.theme-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 38%, rgba(255, 255, 255, 0.16), transparent 62%);
  transform: translateX(-130%);
  pointer-events: none;
}

.theme-card:hover::after {
  animation: sheen 0.85s ease;
}

.preview-photo {
  animation: drift 16s ease-in-out infinite alternate;
}

.preview-haze {
  animation: drift 20s ease-in-out infinite alternate-reverse;
}

.piano-white,
.piano-black {
  transform-origin: top center;
}

.piano-white {
  height: 100%;
  flex: 1;
  border-radius: 0 0 3px 3px;
  background: linear-gradient(180deg, #fffefb 0%, #f4ecdf 72%, #e6dcc8 100%);
  box-shadow: inset 0 -7px 8px rgba(0, 0, 0, 0.12);
}

.piano-black {
  position: absolute;
  top: 0;
  z-index: 2;
  height: 62%;
  width: 6.2%;
  border-radius: 0 0 2px 2px;
  background: linear-gradient(180deg, #3a342e, #100e0c 46%, #050403);
  box-shadow: 0 3px 4px rgba(0, 0, 0, 0.45);
}

.is-played {
  animation: key-play 3.4s cubic-bezier(0.2, 0.7, 0.3, 1) infinite;
}

.check-pop {
  animation: pop 0.38s cubic-bezier(0.2, 1.45, 0.4, 1) both;
}

.eq-bar {
  display: block;
  width: 2px;
  height: 100%;
  transform-origin: bottom;
  border-radius: 1px;
  animation: eq 0.8s ease-in-out infinite;
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(10px) scale(0.97); }
  to { opacity: 1; transform: none; }
}

@keyframes sheen {
  to { transform: translateX(130%); }
}

@keyframes drift {
  from { transform: scale(1.04); }
  to { transform: scale(1.12) translate3d(-2%, -1%, 0); }
}

@keyframes key-play {
  0%, 72%, 100% { transform: translateY(0); filter: brightness(1); }
  7% {
    transform: translateY(2px) scaleY(0.96);
    filter: brightness(1.2);
    box-shadow: 0 0 10px var(--glow);
  }
}

@keyframes pop {
  from { opacity: 0; transform: scale(0.4); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes eq {
  0%, 100% { transform: scaleY(0.35); }
  50% { transform: scaleY(1); }
}

@media (prefers-reduced-motion: reduce) {
  .lang-btn,
  .theme-card,
  .preview-photo,
  .preview-haze,
  .is-played,
  .check-pop,
  .eq-bar,
  .theme-card::after {
    animation: none !important;
  }
}
</style>