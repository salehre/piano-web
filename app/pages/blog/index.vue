<script setup lang="ts">
const { t, n } = useI18n()
const { posts } = useBlog()
useHead({ title: () => t('blog.title') })
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-12">
    <h1 class="text-3xl font-semibold tracking-tight">{{ t('blog.title') }}</h1>
    <p class="mt-2 max-w-xl text-stone-400">{{ t('blog.subtitle') }}</p>

    <ul class="mt-10 grid gap-4 sm:grid-cols-2">
      <li v-for="p in posts" :key="p.slug">
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
          <div class="flex flex-1 flex-col p-6">
            <span class="text-xs font-medium uppercase tracking-wide text-key-active">{{ p.tag }}</span>
            <h2 class="mt-2 text-lg font-medium">{{ p.title }}</h2>
            <p class="mt-2 flex-1 text-sm text-stone-400">{{ p.excerpt }}</p>
            <p class="mt-4 text-xs text-stone-500">{{ p.dateLabel }} · {{ t('blog.minRead', { n: n(p.readMinutes) }) }}</p>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>