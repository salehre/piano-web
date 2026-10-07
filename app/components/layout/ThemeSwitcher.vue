<script setup lang="ts">
const { t } = useI18n()
const { isLight, toggle } = useTheme()

const label = computed(() => (isLight.value ? t('theme.switchToDark') : t('theme.switchToLight')))
</script>

<template>
  <button
      type="button"
      class="rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
      :aria-label="label"
      :title="label"
      data-cuelume-tap
      data-cuelume-emphasis="subtle"
      @click="toggle"
  >
    <!-- تم روشنه: ماه (برای رفتن به تیره) | تم تیره‌ست: خورشید (برای رفتن به روشن) -->
    <svg v-if="isLight" class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M16.5 11.5A6.5 6.5 0 0 1 8.5 3.5a6.5 6.5 0 1 0 8 8Z" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <svg v-else class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.7 4.7l1.3 1.3M14 14l1.3 1.3M4.7 15.3 6 14M14 6l1.3-1.3" stroke-linecap="round" />
    </svg>
  </button>
</template>
