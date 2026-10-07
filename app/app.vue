<script setup lang="ts">
const { t, locale, localeProperties } = useI18n()
const { theme } = useTheme()

// زبان و جهت صفحه از زبان فعلی میاد (روی سرور هم از روی کوکی درست ست می‌شه)
useHead({
  htmlAttrs: {
    lang: computed(() => localeProperties.value.language ?? locale.value),
    dir: computed(() => localeProperties.value.dir ?? 'ltr'),
    // تم فعلی (dark | light)؛ از کوکی میاد پس SSR هم از همون اول درست رندر می‌شه
    'data-theme': computed(() => theme.value),
  },
  // صفحه‌ها فقط عنوان خودشون رو می‌دن؛ اسم برنامه اینجا اضافه می‌شه
  titleTemplate: (title) => {
    const name = t('app.name')
    return title && title !== name ? `${title} | ${name}` : name
  },
})
</script>

<template>
  <UiGlassFilter />
  <UiRotateToast />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
