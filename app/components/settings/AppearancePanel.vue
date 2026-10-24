<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'

const { t, locale, locales, setLocale } = useI18n()
const { theme, setTheme } = useTheme()

const langs = computed(() => (locales.value as LocaleObject[]).map((l) => ({ code: l.code, language: l.language })))

// رنگ‌های پیش‌نمایش هر کارت ثابت‌ان (مستقل از تم فعلی) تا هر تم همون‌طور که هست دیده بشه
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

// کلیدهای کوچیک پیش‌نمایش: ۱۴ کلید سفید، و کلید مشکی بعد از کلیدهای ۰،۱،۳،۴،۵ هر اکتاو
const WHITE_KEYS = 14
const KEY_W = 10
const BLACK_AFTER = new Set([0, 1, 3, 4, 5])
const blackKeys = Array.from({ length: WHITE_KEYS - 1 }, (_, i) => i).filter((i) => BLACK_AFTER.has(i % 7))

const base =
  'flex min-w-28 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-key-active/60'
const on = 'border-key-active bg-key-active text-stone-950'
const off = 'border-stone-700/60 bg-stone-950/30 text-stone-200 hover:bg-stone-800/60'
</script>

<template>
  <div class="space-y-4">
    <!-- زبان -->
    <section class="rounded-2xl border border-stone-700/40 bg-stone-950/30 p-5" role="radiogroup" :aria-label="t('settings.appearance.language')">
      <h3 class="text-sm font-medium">{{ t('settings.appearance.language') }}</h3>
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="l in langs"
          :key="l.code"
          type="button"
          role="radio"
          :aria-checked="locale === l.code"
          :lang="l.language"
          :class="[base, locale === l.code ? on : off]"
          data-cuelume-tap
          data-cuelume-emphasis="subtle"
          @click="setLocale(l.code)"
        >
          {{ t(`settings.appearance.languages.${l.code}`) }}
        </button>
      </div>
    </section>

    <!-- تم -->
    <section class="rounded-2xl border border-stone-700/40 bg-stone-950/30 p-5" role="radiogroup" :aria-label="t('settings.appearance.theme')">
      <h3 class="text-sm font-medium">{{ t('settings.appearance.theme') }}</h3>

      <div class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <button
          v-for="th in THEMES"
          :key="th"
          type="button"
          role="radio"
          :aria-checked="theme === th"
          class="relative flex flex-col overflow-hidden rounded-2xl border p-3 text-start transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-key-active/60"
          :class="theme === th ? 'border-key-active shadow-[0_0_24px_-8px_var(--color-key-active)]' : 'hover:-translate-y-0.5'"
          :style="{
            background: previews[th].bg,
            color: previews[th].text,
            ...(theme === th ? {} : { borderColor: previews[th].border }),
          }"
          data-cuelume-tap
          data-cuelume-emphasis="subtle"
          @click="setTheme(th)"
        >
          <!-- تیک انتخاب -->
          <span
            v-if="theme === th"
            class="absolute end-2.5 top-2.5 z-10 grid size-5 place-items-center rounded-full bg-key-active text-stone-950"
            aria-hidden="true"
          >
            <svg class="size-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.6">
              <path d="m5 10.5 3.5 3.5L15 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>

          <!-- پیش‌نمایش: تصویر واضح داخل کادر و ادامه‌ی مات آن در حاشیه -->
          <div
            class="relative isolate aspect-4/3 rounded-xl border"
            :style="{
              borderColor: previews[th].border,
              boxShadow: `inset 0 0 36px 8px ${previews[th].glow}`,
            }"
            aria-hidden="true"
          >
            <div
              class="absolute -inset-3 -z-10 rounded-2xl blur-[3px]"
              :style="{
                backgroundImage: `linear-gradient(${previews[th].glow}, ${previews[th].glow}), url('/images/theme-bg.webp')`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }"
            />
            <div
              class="absolute inset-0 z-0 rounded-[inherit]"
              :style="{
                backgroundImage: `linear-gradient(${previews[th].glow}, ${previews[th].glow}), url('/images/theme-bg.webp')`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }"
            />
          </div>

          <span class="mt-3 text-sm font-semibold">{{ t(`settings.appearance.themes.${th}.name`) }}</span>
          <span class="mt-0.5 text-xs" :style="{ color: previews[th].sub }">{{ t(`settings.appearance.themes.${th}.description`) }}</span>
        </button>
      </div>
    </section>
  </div>
</template>
