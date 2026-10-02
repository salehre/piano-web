<script setup lang="ts">
import type { UserProfile } from '~/utils/auth'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Profile | Web Piano' })

const { user, ready, updateProfile, logout } = useAuth()

/** فرم همه‌ی فیلدها رو رشته نگه می‌داره تا v-model ساده بمونه */
interface ProfileForm {
  displayName: string
  bio: string
  country: string
  level: string
  favoriteGenre: string
  yearsPlaying: string
}

const toForm = (p: UserProfile): ProfileForm => ({
  displayName: p.displayName,
  bio: p.bio,
  country: p.country,
  level: p.level,
  favoriteGenre: p.favoriteGenre,
  yearsPlaying: p.yearsPlaying === null ? '' : String(p.yearsPlaying),
})

const toProfile = (f: ProfileForm): UserProfile => ({
  displayName: f.displayName.trim(),
  bio: f.bio.trim(),
  country: f.country.trim(),
  level: f.level as UserProfile['level'],
  favoriteGenre: f.favoriteGenre,
  yearsPlaying: f.yearsPlaying.trim() === '' ? null : Number(f.yearsPlaying),
})

const form = reactive<ProfileForm>(toForm(createEmptyProfile()))
const errors = reactive<{ displayName?: string; yearsPlaying?: string }>({})
const saving = ref(false)
const saved = ref(false)
const formError = ref('')
let initialised = false

// فرم یک بار با اطلاعات کاربر پر می‌شه (بعد از mount که کاربر از حافظه لود شد)
watch(
    user,
    (u) => {
      if (!u || initialised) return
      initialised = true
      Object.assign(form, toForm(u.profile))
    },
    { immediate: true },
)

// نشست قدیمی یا کاربر حذف‌شده
watch(
    [ready, user],
    ([isReady, u]) => {
      if (isReady && !u) navigateTo({ path: '/login', query: { redirect: '/profile' } })
    },
    { immediate: true },
)

const baseline = computed(() => (user.value ? toForm(user.value.profile) : null))
const dirty = computed(() => {
  const base = baseline.value
  if (!base) return false
  return (Object.keys(form) as (keyof ProfileForm)[]).some((k) => form[k] !== base[k])
})

const completion = computed(() => (user.value ? profileCompletion(user.value.profile) : 0))
const memberSince = computed(() =>
    user.value
        ? new Date(user.value.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '',
)

watch(form, () => {
  saved.value = false
})

function validateYears(value: string): string | null {
  if (value.trim() === '') return null
  const n = Number(value)
  if (!Number.isInteger(n) || n < 0 || n > 80) return 'Enter a whole number between 0 and 80.'
  return null
}

async function save() {
  if (saving.value) return
  formError.value = ''
  errors.displayName = validateDisplayName(form.displayName) ?? undefined
  errors.yearsPlaying = validateYears(form.yearsPlaying) ?? undefined
  if (errors.displayName || errors.yearsPlaying) return

  saving.value = true
  const result = await updateProfile(toProfile(form))
  saving.value = false

  if (!result.ok) {
    formError.value = result.error
    return
  }
  // فرم با مقدارهای تمیزشده (trim) هماهنگ می‌شه
  Object.assign(form, toForm(toProfile(form)))
  saved.value = true
}

function revert() {
  if (!baseline.value) return
  Object.assign(form, baseline.value)
  errors.displayName = undefined
  errors.yearsPlaying = undefined
  formError.value = ''
}

async function onLogout() {
  await navigateTo('/')
  logout()
}

const selectClass =
    'w-full rounded-md border border-stone-700 bg-stone-900 px-3 py-2 text-sm focus:border-key-active focus:outline-none focus:ring-2 focus:ring-key-active/40'
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-8">
    <div v-if="!user" class="py-16 text-stone-400" role="status">Loading your profile…</div>

    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div
              class="flex size-14 items-center justify-center rounded-full bg-key-active text-xl font-semibold text-stone-950"
              aria-hidden="true"
          >
            {{ user.profile.displayName.trim().charAt(0).toUpperCase() || '?' }}
          </div>
          <div>
            <h1 class="text-2xl font-semibold">{{ user.profile.displayName || 'Your profile' }}</h1>
            <p class="text-sm text-stone-400">{{ user.email }}</p>
          </div>
        </div>

        <button
            type="button"
            class="rounded-md border border-stone-700 px-3 py-2 text-sm hover:bg-stone-800"
            @click="onLogout"
        >
          Log out
        </button>
      </div>

      <section class="mt-8 rounded-2xl bg-stone-950/40 p-5" aria-labelledby="completion-title">
        <div class="flex items-baseline justify-between">
          <h2 id="completion-title" class="text-sm font-medium">Profile completion</h2>
          <span class="text-sm text-stone-400">{{ completion }}%</span>
        </div>
        <div
            class="mt-3 h-2 overflow-hidden rounded-full bg-stone-800"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="completion"
        >
          <div class="h-full rounded-full bg-key-active transition-all" :style="{ width: `${completion}%` }" />
        </div>
        <p v-if="completion < 100" class="mt-2 text-xs text-stone-400">Fill in the rest of the fields below to complete it.</p>
        <p v-else class="mt-2 text-xs text-stone-400">Your profile is complete.</p>
      </section>

      <form class="mt-8 space-y-8" novalidate @submit.prevent="save">
        <section aria-labelledby="about-title" class="space-y-5">
          <h2 id="about-title" class="border-b border-stone-800 pb-2 text-lg font-medium">About you</h2>

          <UiTextField
              v-model="form.displayName"
              label="Name"
              autocomplete="nickname"
              :maxlength="DISPLAY_NAME_MAX"
              :error="errors.displayName"
          />

          <UiTextField
              v-model="form.bio"
              label="Bio"
              multiline
              :rows="4"
              :maxlength="BIO_MAX"
              placeholder="Tell others a little about yourself and your music."
              :hint="`${form.bio.length} / ${BIO_MAX}`"
          />

          <UiTextField v-model="form.country" label="Country" autocomplete="country-name" :maxlength="60" />
        </section>

        <section aria-labelledby="piano-title" class="space-y-5">
          <h2 id="piano-title" class="border-b border-stone-800 pb-2 text-lg font-medium">Your piano</h2>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="level" class="mb-1.5 block text-sm font-medium">Skill level</label>
              <select id="level" v-model="form.level" :class="selectClass">
                <option value="">Not set</option>
                <option v-for="l in PIANO_LEVELS" :key="l.value" :value="l.value">{{ l.label }}</option>
              </select>
            </div>

            <div>
              <label for="genre" class="mb-1.5 block text-sm font-medium">Favorite genre</label>
              <select id="genre" v-model="form.favoriteGenre" :class="selectClass">
                <option value="">Not set</option>
                <option v-for="g in FAVORITE_GENRES" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
          </div>

          <UiTextField
              v-model="form.yearsPlaying"
              label="Years playing"
              type="number"
              hint="Leave empty if you'd rather not say."
              :error="errors.yearsPlaying"
          />
        </section>

        <section aria-labelledby="account-title" class="space-y-2">
          <h2 id="account-title" class="border-b border-stone-800 pb-2 text-lg font-medium">Account</h2>
          <dl class="grid gap-x-6 gap-y-2 pt-2 text-sm sm:grid-cols-[8rem_1fr]">
            <dt class="text-stone-400">Email</dt>
            <dd>{{ user.email }}</dd>
            <dt class="text-stone-400">Member since</dt>
            <dd>{{ memberSince }}</dd>
          </dl>
        </section>

        <div class="flex flex-wrap items-center gap-3">
          <button
              type="submit"
              class="rounded-lg bg-key-active px-5 py-3 font-medium text-stone-950 transition-opacity hover:opacity-90 disabled:opacity-60"
              :disabled="saving || !dirty"
          >
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
          <button
              v-if="dirty"
              type="button"
              class="rounded-lg px-4 py-3 text-sm text-stone-300 hover:text-key-active"
              @click="revert"
          >
            Discard changes
          </button>
          <span v-if="saved" class="text-sm text-stone-300" role="status">Profile saved.</span>
          <span v-if="formError" class="text-sm text-red-400" role="alert">{{ formError }}</span>
        </div>
      </form>
    </template>
  </main>
</template>