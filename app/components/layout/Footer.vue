<script setup lang="ts">
// لینک‌های شبکه‌های اجتماعی؛ فقط همین‌جا عوضشون کن (اسم باشگاه و بقیه‌ی متن‌ها توی common.json)
const { t, n } = useI18n()
const STORAGE_KEY = 'web-piano-club-emails'

const socials = [
  {
    name: 'Gmail',
    href: 'mailto:salehrezaeipoor123@gmail.com',
    color: 'rgba(234, 67, 53, 0.4)',
    icon: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  },
  {
    name: 'Telegram',
    href: 'https://t.me/cringebutfun',
    color: 'rgba(38, 165, 228, 0.4)',
    icon: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/>',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/salehre',
    color: 'rgba(240, 246, 252, 0.35)',
    icon: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 15 3.48a13.38 13.38 0 0 0-7 0C4.27.65 3.09 1 3.09 1A5.07 5.07 0 0 0 3 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 7 18.13V22"/>',
  },
  {
    name: 'Reddit',
    href: 'https://www.reddit.com/user/salehrezaei/',
    color: 'rgba(255, 69, 0, 0.4)',
    icon: '<path d="M12 8c-4.4 0-8 2-8 5.5S7.6 20 12 20s8-3 8-6.5S16.4 8 12 8Z"/><path d="m12 8 1-4 3 1M4 12l-1.5-1M20 12l1.5-1M9 13h.01M15 13h.01M9 16c1.8 1.4 4.2 1.4 6 0"/><circle cx="17" cy="5" r="1"/>',
  },
]

const links = [
  { label: 'nav.home', to: '/' },
  { label: 'nav.virtualPiano', to: '/virtual-piano' },
  { label: 'nav.blog', to: '/blog' },
  { label: 'nav.settings', to: '/settings' },
]

const year = n(new Date().getFullYear(), 'plain')

// ---------- عضویت در باشگاه ----------
const email = ref('')
const error = ref(false)
const joined = ref(false)
const submitting = ref(false)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

watch(email, () => {
  error.value = false
})

/**
 * فعلاً بک‌اند نداریم، پس ایمیل‌ها فقط توی localStorage همین مرورگر ذخیره می‌شن.
 * وقتی سرور اومد، فقط بدنه‌ی این تابع رو با یه درخواست API عوض کن.
 */
async function saveEmail(value: string) {
  try {
    const list: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!list.includes(value)) list.push(value)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // localStorage در دسترس نیست (مثلاً حالت خصوصی)؛ برای الان بی‌صدا رد می‌شیم
  }
}

async function join() {
  if (submitting.value) return
  const value = email.value.trim().toLowerCase()
  if (!EMAIL_RE.test(value)) {
    error.value = true
    return
  }
  submitting.value = true
  await saveEmail(value)
  submitting.value = false
  joined.value = true
  email.value = ''
}
</script>

<template>
  <footer class="border-t border-white/5 bg-stone-950">
    <div class="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.4fr)]">
      <!-- برند و شبکه‌های اجتماعی -->
      <div class="min-w-0">
        <NuxtLink to="/" class="text-lg font-semibold">{{ t('app.name') }}</NuxtLink>
        <p class="mt-2 max-w-xs text-sm text-stone-400">
          {{ t('footer.description') }}
        </p>

        <ul class="mt-5 flex items-center gap-2" :aria-label="t('footer.social')">
          <li v-for="s in socials" :key="s.name">
            <a
                :href="s.href"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="s.name"
                :title="s.name"
                :style="{ '--social-color': s.color }"
                class="flex size-10 items-center justify-center rounded-full border border-white/5 text-stone-300 transition-all hover:text-key-active hover:shadow-[0_0_14px_var(--social-color)]"
            >
              <svg
                  class="size-4.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  v-html="s.icon"
              />
            </a>
          </li>
        </ul>
      </div>

      <!-- لینک‌ها -->
      <nav class="min-w-0" :aria-label="t('footer.nav')">
        <h2 class="text-sm font-medium uppercase tracking-wide text-stone-400">{{ t('nav.explore') }}</h2>
        <ul class="mt-4 space-y-2">
          <li v-for="l in links" :key="l.to">
            <NuxtLink :to="l.to" class="text-sm text-stone-200 transition-colors hover:text-key-active">
              {{ t(l.label) }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- باشگاه مشتریان -->
      <section aria-labelledby="club-title" class="min-w-0 sm:col-span-2 lg:col-span-1">
        <h2 id="club-title" class="text-sm font-medium uppercase tracking-wide text-stone-400">
          {{ t('footer.clubName') }}
        </h2>
        <p class="mt-4 text-sm text-stone-300">
          {{ t('footer.clubText') }}
        </p>

        <p
            v-if="joined"
            class="mt-4 rounded-md bg-stone-900 px-3 py-2 text-sm text-key-active"
            role="status"
        >
          {{ t('footer.joined') }}
        </p>

        <form v-else class="mt-4" novalidate @submit.prevent="join">
          <label for="club-email" class="sr-only">{{ t('footer.emailLabel') }}</label>
          <div class="flex flex-col gap-2 sm:flex-row">
            <input
                id="club-email"
                v-model="email"
                type="email"
                inputmode="email"
                autocomplete="email"
                placeholder="you@example.com"
                dir="ltr"
                :aria-invalid="!!error"
                :aria-describedby="error ? 'club-email-error' : undefined"
                :class="[
                'w-full min-w-0 rounded-md border bg-stone-900 px-3 py-2 text-sm placeholder:text-stone-500 focus:outline-none focus:ring-2',
                error
                  ? 'border-red-400 focus:ring-red-400/40'
                  : 'border-stone-700 focus:border-key-active focus:ring-key-active/40',
              ]"
            />
            <button
                type="submit"
                class="w-full shrink-0 rounded-md bg-key-active px-5 py-2 text-sm font-medium text-stone-950 transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
                :disabled="submitting"
            >
              {{ t('footer.join') }}
            </button>
          </div>
          <p v-if="error" id="club-email-error" class="mt-1.5 text-sm text-red-400" role="alert">{{ t('footer.invalidEmail') }}</p>
        </form>
      </section>
    </div>

    <div class="border-t border-white/5">
      <div class="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-4 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p class="min-w-0">{{ t('footer.rights', { year }) }}</p>
        <p class="min-w-0 sm:text-end">{{ t('footer.poweredBy') }}</p>
      </div>
    </div>
  </footer>
</template>