<script setup lang="ts">
const { t, locale, localeProperties } = useI18n()
const { theme } = useTheme()

// رنگ نوار مرورگر/PWA هر تم
const THEME_COLORS: Record<string, string> = { dark: '#170701', navy: '#070d1a', wine: '#14040a', light: '#F5E6C8' }

// زبان و جهت صفحه از زبان فعلی میاد (روی سرور هم از روی کوکی درست ست می‌شه)
useHead({
  htmlAttrs: {
    lang: computed(() => localeProperties.value.language ?? locale.value),
    dir: computed(() => localeProperties.value.dir ?? 'ltr'),
    // تم فعلی (navy | dark | wine | light)؛ از کوکی میاد پس SSR هم از همون اول درست رندر می‌شه
    'data-theme': computed(() => theme.value),
  },
  meta: [{ name: 'theme-color', content: computed(() => THEME_COLORS[theme.value] ?? '#170701') }],
  // صفحه‌ها فقط عنوان خودشون رو می‌دن؛ اسم برنامه اینجا اضافه می‌شه
  titleTemplate: (title) => {
    const name = t('app.name')
    return title && title !== name ? `${title} | ${name}` : name
  },
})
</script>

<template>
  <!-- لینک manifest وب‌اپ (PWA) رو توی head می‌ذاره -->
  <NuxtPwaManifest />
  <UiRotateToast />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>