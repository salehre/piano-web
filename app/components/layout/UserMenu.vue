<script setup lang="ts">
const { isLoggedIn, initial } = useAuth()

// لاگین‌نکرده: میدلور auth می‌فرستدش به /login?redirect=/profile (و از اونجا لینک ثبت‌نام)
// لاگین‌کرده: مستقیم میره توی پروفایل و تنظیمات حساب
const label = computed(() => (isLoggedIn.value ? 'Open your profile' : 'Log in or sign up'))
</script>

<template>
  <NuxtLink
      to="/profile"
      class="ml-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
      active-class="text-key-active"
      :aria-label="label"
      :title="label"
      data-cuelume-navigate
  >
    <span
        v-if="isLoggedIn && initial"
        class="flex size-6 items-center justify-center rounded-full bg-key-active text-xs font-semibold text-stone-950"
        aria-hidden="true"
    >
      {{ initial }}
    </span>
    <svg v-else class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <circle cx="10" cy="7" r="3" />
      <path d="M4 17c.8-3 3.2-4.5 6-4.5s5.2 1.5 6 4.5" stroke-linecap="round" />
    </svg>
    Profile
  </NuxtLink>
</template>