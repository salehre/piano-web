<script setup lang="ts">
defineProps<{
  title: string
  hint: string
}>()

const BG_IMAGE = '/images/download.webp'
const bgEl = ref<HTMLImageElement>()
const bgFailed = ref(false) // عکس نبود → بدون آیکون خراب، فقط زمینه‌ی ساده
onMounted(() => {
  if (bgEl.value?.complete && bgEl.value.naturalWidth === 0) bgFailed.value = true
})

const titleId = useId()
</script>

<template>
  <main class="grid min-h-dvh bg-stone-950 lg:grid-cols-2">
    <!-- نیمه‌ی فرم -->
    <div class="relative isolate flex items-center justify-center overflow-hidden px-6 py-12">
      <div
          class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_10%,rgb(255_255_255/0.05),transparent_55%)]"
          aria-hidden="true"
      />

      <section
          class="glass-card relative w-full max-w-sm border border-stone-700/50 bg-stone-950/60 p-6 shadow-2xl shadow-black/40 sm:p-8"
          :aria-labelledby="titleId"
      >
        <header class="text-center">
          <img src="/icon.svg" alt="" class="mx-auto size-10" aria-hidden="true">
          <h1 :id="titleId" class="mt-4 text-2xl font-semibold text-key-active">{{ title }}</h1>
          <p class="mt-1.5 text-sm text-stone-400">{{ hint }}</p>
        </header>

        <slot />
      </section>
    </div>

    <aside
        class="relative hidden overflow-hidden bg-linear-to-br from-stone-900 to-stone-950 lg:block"
        aria-hidden="true"
    >
      <img
          v-if="!bgFailed"
          ref="bgEl"
          :src="BG_IMAGE"
          alt=""
          class="absolute inset-0 size-full select-none object-cover object-center"
          @error="bgFailed = true"
      >
      <div class="absolute inset-0 bg-linear-to-t from-stone-950/70 via-stone-950/10 to-stone-950/30" />
    </aside>
  </main>
</template>