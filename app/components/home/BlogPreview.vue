<script setup lang="ts">
const { t, n } = useI18n()
const { posts } = useBlog()
const latest = computed(() => posts.value.slice(0, 3))
</script>

<template>
  <section aria-labelledby="blog-title" class="relative isolate">
    <!-- هاله‌ی نور ملایم پشت کارت‌ها -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-160 max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-key-active/10 blur-3xl"
    />

    <!-- هدر -->
    <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      <div class="max-w-xl">
        <span
          aria-hidden="true"
          class="mb-4 block h-1 w-10 rounded-full bg-linear-to-r from-key-active to-transparent"
        />
        <h2 id="blog-title" class="text-2xl font-semibold tracking-tight text-stone-100 sm:text-3xl">
          {{ t('blogPreview.title') }}
        </h2>
        <p class="mt-3 text-sm leading-relaxed text-stone-400 sm:text-base">
          {{ t('blogPreview.subtitle') }}
        </p>
      </div>

      <NuxtLink
        to="/blog"
        class="group inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-stone-200 backdrop-blur-sm transition-all duration-300 hover:border-key-active/50 hover:bg-key-active/10 hover:text-key-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-key-active/70"
      >
        {{ t('blogPreview.viewAll') }}
        <span
          aria-hidden="true"
          class="inline-block transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
        >
          →
        </span>
      </NuxtLink>
    </div>

    <!-- کارت‌ها -->
    <ul class="mt-10 grid gap-5 md:grid-cols-3">
      <li
        v-for="(p, i) in latest"
        :key="p.slug"
        class="reveal"
        :style="{ '--delay': `${i * 100}ms` }"
      >
        <NuxtLink
          :to="`/blog/${p.slug}`"
          class="glass-card group relative flex h-full flex-col overflow-hidden rounded-4xl ring-1 ring-white/10 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:ring-key-active/40 hover:shadow-[0_30px_60px_-25px_rgba(245,230,200,0.35)] focus-visible:outline-none"
        >
          <!-- تصویر -->
          <div class="relative aspect-16/10 overflow-hidden">
            <img
              :src="p.image"
              alt=""
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div
              aria-hidden="true"
              class="absolute inset-0 bg-linear-to-t from-stone-950/70 via-stone-950/10 to-transparent"
            />

            <!-- برچسب روی تصویر -->
            <span
              class="absolute inset-s-4 top-4 rounded-full border border-white/15 bg-stone-950/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-key-active backdrop-blur-md"
            >
              {{ p.tag }}
            </span>

            <!-- فلشی که با هاور ظاهر می‌شود -->
            <span
              aria-hidden="true"
              class="absolute bottom-4 inset-e-4 flex size-9 translate-y-2 items-center justify-center rounded-full bg-key-active text-stone-950 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 rtl:rotate-180"
            >
              →
            </span>
          </div>

          <!-- متن -->
          <div class="flex flex-1 flex-col p-6">
            <h3
              class="line-clamp-2 text-lg font-semibold leading-snug text-stone-100 transition-colors duration-300 group-hover:text-key-active"
            >
              {{ p.title }}
            </h3>
            <p class="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-stone-400">
              {{ p.excerpt }}
            </p>

            <div
              class="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/5 pt-4 text-xs text-stone-500"
            >
              <span class="inline-flex items-center gap-1.5">
                <svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                {{ p.dateLabel }}
              </span>
              <span aria-hidden="true" class="size-1 rounded-full bg-stone-600" />
              <span class="inline-flex items-center gap-1.5">
                <svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {{ t('blog.minRead', { n: n(p.readMinutes) }) }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.reveal {
  animation: reveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--delay, 0ms);
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    animation: none;
  }
}
</style>