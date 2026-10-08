<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'

const { t, locale, locales, setLocale } = useI18n()
const { theme, setTheme } = useTheme()

const langs = computed(() => (locales.value as LocaleObject[]).map((l) => ({ code: l.code, language: l.language })))

const themes = [
  { value: 'dark', label: 'settings.appearance.dark' },
  { value: 'light', label: 'settings.appearance.light' },
] as const

const base =
  'flex min-w-28 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-key-active/60'
const on = 'border-key-active bg-key-active text-stone-950'
const off = 'border-stone-700 text-stone-200 hover:bg-stone-800'
</script>

<template>
  <section aria-labelledby="appearance-title">
    <h2 id="appearance-title" class="text-lg font-medium">{{ t('settings.appearance.title') }}</h2>
    <p class="mt-1 text-sm text-stone-400">{{ t('settings.appearance.description') }}</p>

    <div class="mt-4 grid gap-5 sm:grid-cols-2">
      <!-- زبان -->
      <div role="radiogroup" :aria-label="t('settings.appearance.language')">
        <p class="mb-2 text-sm text-stone-400">{{ t('settings.appearance.language') }}</p>
        <div class="flex flex-wrap gap-2">
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
      </div>

      <!-- تم -->
      <div role="radiogroup" :aria-label="t('settings.appearance.theme')">
        <p class="mb-2 text-sm text-stone-400">{{ t('settings.appearance.theme') }}</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="th in themes"
            :key="th.value"
            type="button"
            role="radio"
            :aria-checked="theme === th.value"
            :class="[base, theme === th.value ? on : off]"
            data-cuelume-tap
            data-cuelume-emphasis="subtle"
            @click="setTheme(th.value)"
          >
            <svg v-if="th.value === 'dark'" class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M16.5 11.5A6.5 6.5 0 0 1 8.5 3.5a6.5 6.5 0 1 0 8 8Z" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <circle cx="10" cy="10" r="3.5" />
              <path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.7 4.7l1.3 1.3M14 14l1.3 1.3M4.7 15.3 6 14M14 6l1.3-1.3" stroke-linecap="round" />
            </svg>
            {{ t(th.label) }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>