<script setup lang="ts">
const { t, n } = useI18n()
const { posts } = useBlog()
const latest = computed(() => posts.value.slice(0, 3))
</script>

<template>
  <section aria-labelledby="blog-title">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h2 id="blog-title" class="text-2xl font-semibold tracking-tight">{{ t('blogPreview.title') }}</h2>
        <p class="mt-2 text-sm text-stone-400">{{ t('blogPreview.subtitle') }}</p>
      </div>
      <NuxtLink to="/blog" class="shrink-0 text-sm text-stone-200 transition-colors hover:text-key-active">
        {{ t('blogPreview.viewAll') }}
        <span class="inline-block rtl:rotate-180" aria-hidden="true">→</span>
      </NuxtLink>
    </div>

    <ul class="mt-6 grid gap-4 sm:grid-cols-3">
      <li v-for="p in latest" :key="p.slug">
        <NuxtLink
          :to="`/blog/${p.slug}`"
          class="glass-card group flex h-full flex-col overflow-hidden rounded-4xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/5 hover:shadow-[0_20px_40px_-20px_rgba(245,230,200,0.3)]"
        >
          <img
            :src="p.image"
            alt=""
            loading="lazy"
            class="aspect-video w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          <div class="flex flex-1 flex-col p-5">
            <span class="text-xs font-medium uppercase tracking-wide text-key-active">{{ p.tag }}</span>
            <h3 class="mt-2 font-medium">{{ p.title }}</h3>
            <p class="mt-2 flex-1 text-sm text-stone-400">{{ p.excerpt }}</p>
            <p class="mt-4 text-xs text-stone-500">{{ p.dateLabel }} · {{ t('blog.minRead', { n: n(p.readMinutes) }) }}</p>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>