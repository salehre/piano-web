<template>
  <div class="relative isolate flex min-h-screen flex-col overflow-clip">
    <LayoutPianoLight />
    <LayoutHeader />
    <div class="flex-1">
      <slot />
    </div>
    <LayoutFooter />
  </div>
</template>