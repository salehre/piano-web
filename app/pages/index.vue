<script setup lang="ts">
const { t } = useI18n()
// عنوان صفحه‌ی اصلی همون اسم برنامه است (titleTemplate توی app.vue)

// تصویر پس‌زمینه‌ی هیرو (همون عکس پیانوی تاریک)؛ برای عوض کردنش فقط همین خط رو تغییر بده
const HERO_IMAGE = '/images/1.png'

// آیکون‌ها (viewBox 24×24، خط‌دار)
const highlights = [
  {
    id: 'touch',
    icon: '<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.5a6 6 0 0 1-4.7-2.3L4 15.5a1.6 1.6 0 0 1 2.4-2L9 15.5"/>',
  },
  {
    id: 'keyboard',
    icon: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M7 14h10"/>',
  },
  {
    id: 'midi',
    icon: '<circle cx="12" cy="12" r="9"/><path d="M7.5 12h.01M8.6 8.4h.01M12 7h.01M15.4 8.4h.01M16.5 12h.01M9 16.5h6"/>',
  },
  {
    id: 'install',
    icon: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="m9 10.5 2.2 2.2L15.5 8.5M8 21h8M12 17v4"/>',
  },
] as const
</script>

<template>
  <main>
    <!-- هیرو: عکس تمام‌عرض + متن + نوار ویژگی‌ها -->
    <section class="relative isolate overflow-hidden">
      <img
        :src="HERO_IMAGE"
        alt=""
        aria-hidden="true"
        fetchpriority="high"
        class="absolute inset-0 -z-20 size-full object-cover object-[70%_center] rtl:object-[30%_center]"
      />
      <!-- متن روی سمت تیره می‌شینه؛ پایین هم برای نوار ویژگی‌ها تیره می‌شه -->
      <div
        class="absolute inset-0 -z-10 bg-linear-to-r from-stone-950 via-stone-950/70 to-stone-950/10 rtl:bg-linear-to-l"
        aria-hidden="true"
      />
      <div
        class="absolute inset-0 -z-10 bg-linear-to-t from-stone-950 via-transparent to-stone-950/40"
        aria-hidden="true"
      />

      <div
        class="mx-auto flex min-h-112 max-w-5xl flex-col justify-between gap-12 px-6 pt-14 pb-8 sm:pt-20 lg:min-h-[calc(80svh-3.75rem)]"
      >
        <div class="flex max-w-xl flex-col items-start gap-6">
          <h1 class="font-serif text-4xl leading-[1.1] font-medium sm:text-6xl rtl:font-sans rtl:leading-[1.35]">
            {{ t('home.hero.line1') }}<br class="hidden sm:block" />
            {{ t('home.hero.line2') }}
          </h1>
          <p class="max-w-md text-base leading-relaxed text-stone-300 sm:text-lg">
            {{ t('home.hero.text') }}
          </p>
          <NuxtLink
            to="/virtual-piano"
            class="inline-flex items-center gap-2.5 rounded-full bg-key-active px-6 py-3 font-medium text-stone-950 shadow-[0_10px_28px_-10px_var(--color-key-active)] transition-opacity hover:opacity-90"
            data-cuelume-navigate
          >
            {{ t('home.hero.cta') }}
            <svg class="size-4 rtl:-scale-x-100" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M4 10h12m-4.5-4.5L16 10l-4.5 4.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </NuxtLink>
        </div>

        <ul class="glass-card relative grid grid-cols-2 gap-x-4 gap-y-5 p-5 [--glass-radius:1.5rem] lg:grid-cols-4 lg:p-6">
          <li v-for="h in highlights" :key="h.id" class="flex items-center gap-3">
            <span
              class="grid size-11 shrink-0 place-items-center rounded-xl border border-stone-700/50 bg-stone-950/40 text-key-active"
              aria-hidden="true"
            >
              <svg
                class="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                v-html="h.icon"
              />
            </span>
            <span class="min-w-0">
              <span class="block text-sm font-medium">{{ t(`home.highlights.${h.id}.title`) }}</span>
              <span class="block text-xs text-stone-400">{{ t(`home.highlights.${h.id}.text`) }}</span>
            </span>
          </li>
        </ul>
      </div>
    </section>

    <div class="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16 sm:py-24">
      <HomePianoFinder />

      <HomeFaq />

      <HomeBlogPreview />
    </div>
  </main>
</template>
<style>
.a{
  scale: none;
}
</style>