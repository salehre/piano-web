<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'

const { t, locale, locales, setLocale } = useI18n()

// فقط زبان‌های دیگه نشون داده می‌شن؛ با دو زبان همین یک دکمه‌ی «تغییر زبان» می‌شه
const others = computed(() => (locales.value as LocaleObject[]).filter((l) => l.code !== locale.value))
</script>

<template>
  <button
      v-for="l in others"
      :key="l.code"
      type="button"
      class="rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
      :lang="l.language"
      :aria-label="t('language.switchTo', { name: l.name ?? l.code })"
      data-cuelume-tap
      data-cuelume-emphasis="subtle"
      @click="setLocale(l.code)"
  >
    {{ l.name }}
  </button>
</template>
