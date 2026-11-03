<script setup lang="ts">
const { t, locale, localeProperties } = useI18n()
const { theme } = useTheme()

const THEME_COLORS: Record<string, string> = { dark: '#170701', navy: '#070d1a', wine: '#14040a', light: '#F5E6C8' }

useHead({
  htmlAttrs: {
    lang: computed(() => localeProperties.value.language ?? locale.value),
    dir: computed(() => localeProperties.value.dir ?? 'ltr'),
    'data-theme': computed(() => theme.value),
  },
  meta: [{ name: 'theme-color', content: computed(() => THEME_COLORS[theme.value] ?? '#170701') }],
  titleTemplate: (title) => {
    const name = t('app.name')
    return title && title !== name ? `${title} | ${name}` : name
  },
})
</script>

<template>
  <NuxtPwaManifest />
  <UiRotateToast />
  <UiAppToaster />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>