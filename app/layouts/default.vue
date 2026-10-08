<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="relative isolate flex min-h-screen flex-col overflow-clip">
    <LayoutPianoLight />
    <LayoutHeader />
    <!-- پایین‌ِ محتوا توی موبایل جا برای داک شناور خالی می‌مونه -->
    <div class="flex-1 pb-24 lg:pb-0">
      <slot />
    </div>
    <LayoutFooter v-if="route.path === '/'" />
    <LayoutMobileDock />
  </div>
</template>