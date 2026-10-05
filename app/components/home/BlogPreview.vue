<script setup lang="ts">
const latest = BLOG_POSTS.slice(0, 3)
</script>

<template>
  <section aria-labelledby="blog-title">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h2 id="blog-title" class="text-2xl font-semibold tracking-tight">From the blog</h2>
        <p class="mt-2 text-sm text-stone-400">Tips, guides and ideas to help you play better.</p>
      </div>
      <NuxtLink to="/blog" class="shrink-0 text-sm text-stone-200 transition-colors hover:text-key-active">
        View all posts →
      </NuxtLink>
    </div>

    <ul class="mt-6 grid gap-4 sm:grid-cols-3">
      <li v-for="p in latest" :key="p.slug">
        <NuxtLink
          :to="`/blog/${p.slug}`"
          class="flex h-full flex-col rounded-2xl border border-stone-800 bg-stone-950/40 p-5 transition-colors hover:border-stone-700 hover:bg-stone-950/70"
        >
          <span class="text-xs font-medium uppercase tracking-wide text-key-active">{{ p.tag }}</span>
          <h3 class="mt-2 font-medium">{{ p.title }}</h3>
          <p class="mt-2 flex-1 text-sm text-stone-400">{{ p.excerpt }}</p>
          <p class="mt-4 text-xs text-stone-500">{{ formatBlogDate(p.date) }} · {{ p.readMinutes }} min read</p>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>