<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="relative isolate flex min-h-screen flex-col overflow-clip">
    <LayoutPianoLight />
    <LayoutHeader />
    <div class="flex-1">
      <slot />
    </div>
    <LayoutFooter v-if="route.path === '/'" />
  </div>
</template>