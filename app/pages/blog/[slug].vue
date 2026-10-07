<script setup lang="ts">
const { t, n } = useI18n()
const route = useRoute()
const { getPost } = useBlog()
// computed تا با عوض شدن زبان، متن مقاله همون لحظه عوض بشه
const post = computed(() => getPost(String(route.params.slug)))

if (!post.value) {
  // statusMessage باید ASCII باشه (هدر HTTP)؛ متن ترجمه‌شده توی message میره
  throw createError({ statusCode: 404, statusMessage: 'Not Found', message: t('blog.notFound'), fatal: true })
}

useHead({ title: () => post.value?.title })
</script>

<template>
  <main v-if="post" class="mx-auto max-w-2xl px-6 py-12">
    <NuxtLink to="/blog" class="text-sm text-stone-400 transition-colors hover:text-key-active">
      <span class="inline-block rtl:rotate-180" aria-hidden="true">←</span>
      {{ t('blog.back') }}
    </NuxtLink>

    <article class="glass-card mt-6 overflow-hidden">
      <img
        :src="post.image"
        alt=""
        class="h-48 w-full object-cover object-center sm:h-64"
      />

      <div class="p-6 sm:p-8">
        <span class="text-xs font-medium uppercase tracking-wide text-key-active">{{ post.tag }}</span>
        <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{{ post.title }}</h1>
        <p class="mt-3 text-sm text-stone-500">{{ post.dateLabel }} · {{ t('blog.minRead', { n: n(post.readMinutes) }) }}</p>

        <div class="mt-8 space-y-5 leading-relaxed text-stone-300">
          <template v-for="(b, i) in post.content" :key="i">
            <h2 v-if="b.type === 'h2'" class="pt-4 text-xl font-semibold text-stone-100">{{ b.text }}</h2>
            <p v-else-if="b.type === 'p'">{{ b.text }}</p>
            <ul v-else class="list-disc space-y-2 ps-6 marker:text-key-active">
              <li v-for="item in b.items" :key="item">{{ item }}</li>
            </ul>
          </template>
        </div>
      </div>
    </article>

    <div class="glass-card mt-12 rounded-2xl p-6">
      <p class="font-medium">{{ t('blog.cta.title') }}</p>
      <p class="mt-1 text-sm text-stone-400">{{ t('blog.cta.text') }}</p>
      <NuxtLink
        to="/virtual-piano"
        class="mt-4 inline-block rounded-lg bg-key-active px-5 py-2.5 text-sm font-medium text-stone-950 transition-opacity hover:opacity-90"
      >
        {{ t('blog.cta.button') }}
      </NuxtLink>
    </div>
  </main>
</template>