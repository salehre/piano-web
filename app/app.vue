<script setup lang="ts">
const { t, locale, localeProperties } = useI18n()

// زبان و جهت صفحه از زبان فعلی میاد (روی سرور هم از روی کوکی درست ست می‌شه)
useHead({
  htmlAttrs: {
    lang: computed(() => localeProperties.value.language ?? locale.value),
    dir: computed(() => localeProperties.value.dir ?? 'ltr'),
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
