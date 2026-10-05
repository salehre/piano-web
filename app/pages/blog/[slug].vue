<script setup lang="ts">
const route = useRoute()
const post = getBlogPost(String(route.params.slug))

if (!post) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}

useHead({ title: `${post.title} | Web Piano` })
</script>

<template>
  <main v-if="post" class="mx-auto max-w-2xl px-6 py-12">
    <NuxtLink to="/blog" class="text-sm text-stone-400 transition-colors hover:text-key-active">← Back to blog</NuxtLink>

    <article class="glass-card mt-6 overflow-hidden">
      <img
        :src="post.image"
        alt=""
        class="h-48 w-full object-cover object-center sm:h-64"
      />

      <div class="p-6 sm:p-8">
        <span class="text-xs font-medium uppercase tracking-wide text-key-active">{{ post.tag }}</span>
        <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{{ post.title }}</h1>
        <p class="mt-3 text-sm text-stone-500">{{ formatBlogDate(post.date) }} · {{ post.readMinutes }} min read</p>

        <div class="mt-8 space-y-5 leading-relaxed text-stone-300">
          <template v-for="(b, i) in post.content" :key="i">
            <h2 v-if="b.type === 'h2'" class="pt-4 text-xl font-semibold text-stone-100">{{ b.text }}</h2>
            <p v-else-if="b.type === 'p'">{{ b.text }}</p>
            <ul v-else class="list-disc space-y-2 pl-6 marker:text-key-active">
              <li v-for="item in b.items" :key="item">{{ item }}</li>
            </ul>
          </template>
        </div>
      </div>
    </article>

    <div class="glass-card mt-12 rounded-2xl p-6">
      <p class="font-medium">Ready to play?</p>
      <p class="mt-1 text-sm text-stone-400">Put it into practice on the virtual piano. No install needed.</p>
      <NuxtLink
        to="/virtual-piano"
        class="mt-4 inline-block rounded-lg bg-key-active px-5 py-2.5 text-sm font-medium text-stone-950 transition-opacity hover:opacity-90"
      >
        Play virtual piano
      </NuxtLink>
    </div>
  </main>
</template>