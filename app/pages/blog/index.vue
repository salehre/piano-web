<script setup lang="ts">
useHead({ title: 'Blog | Web Piano' })
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-12">
    <h1 class="text-3xl font-semibold tracking-tight">Blog</h1>
    <p class="mt-2 max-w-xl text-stone-400">Tips, guides and ideas to help you enjoy and improve your piano playing.</p>

    <ul class="mt-10 grid gap-4 sm:grid-cols-2">
      <li v-for="p in BLOG_POSTS" :key="p.slug">
        <NuxtLink
          :to="`/blog/${p.slug}`"
          class="flex h-full flex-col rounded-2xl border border-stone-800 bg-stone-950/40 p-6 transition-colors hover:border-stone-700 hover:bg-stone-950/70"
        >
          <span class="text-xs font-medium uppercase tracking-wide text-key-active">{{ p.tag }}</span>
          <h2 class="mt-2 text-lg font-medium">{{ p.title }}</h2>
          <p class="mt-2 flex-1 text-sm text-stone-400">{{ p.excerpt }}</p>
          <p class="mt-4 text-xs text-stone-500">{{ formatBlogDate(p.date) }} · {{ p.readMinutes }} min read</p>
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>