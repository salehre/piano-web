<script setup lang="ts">
import type { UserProfile } from '~/utils/auth'

definePageMeta({ middleware: 'auth' })
const { t, n, d } = useI18n()
const tr = useTr()
useHead({ title: () => t('nav.profile') })

const { user, ready, updateProfile, logout } = useAuth()

/** فرم همه‌ی فیلدها رو رشته نگه می‌داره تا v-model ساده بمونه */
interface ProfileForm {
  displayName: string
  email: string
  avatar: string
  nationalId: string
  country: string
  address: string
  yearsPlaying: string
}

const toForm = (p: UserProfile): ProfileForm => ({
  displayName: p.displayName,
  email: p.email,
  avatar: p.avatar,
  nationalId: p.nationalId,
  country: p.country,
  address: p.address,
  yearsPlaying: p.yearsPlaying === null ? '' : String(p.yearsPlaying),
})

const toProfile = (f: ProfileForm): UserProfile => ({
  displayName: f.displayName.trim(),
  email: f.email.trim(),
  avatar: f.avatar,
  nationalId: normalizeDigits(f.nationalId).trim(),
  country: f.country.trim(),
  address: f.address.trim(),
  yearsPlaying: f.yearsPlaying.trim() === '' ? null : Number(f.yearsPlaying),
})

const form = reactive<ProfileForm>(toForm(createEmptyProfile()))
// خطاها ارجاع به پیام‌اند تا با عوض شدن زبان ترجمه‌شون عوض بشه
const errors = reactive<{ displayName?: MessageRef; email?: MessageRef; nationalId?: MessageRef; yearsPlaying?: MessageRef }>({})
const showLogoutConfirm = ref(false)
const loggingOut = ref(false)
const saving = ref(false)
const saved = ref(false)
const formError = ref<MessageRef | null>(null)
const avatarError = ref<MessageRef | null>(null)
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
      if (isReady && !u && !loggingOut.value) navigateTo({ path: '/login', query: { redirect: '/profile' } })
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
const memberSince = computed(() => (user.value ? d(new Date(user.value.createdAt), 'long') : ''))

watch(form, () => {
  saved.value = false
})

function validateYears(value: string): MessageRef | null {
  if (value.trim() === '') return null
  const num = Number(value)
  if (!Number.isInteger(num) || num < 0 || num > YEARS_PLAYING_MAX) return msgRef('auth.validation.yearsRange', { min: 0, max: YEARS_PLAYING_MAX })
  return null
}

// ---------- عکس پروفایل ----------
const fileInput = ref<HTMLInputElement | null>(null)

function pickAvatar() {
  fileInput.value?.click()
}

/** عکس انتخاب‌شده رو وسط‌چین و مربع می‌کنه و به JPEG کوچیک تبدیل می‌کنه تا توی localStorage جا بشه */
function resizeToAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const side = Math.min(img.naturalWidth, img.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = AVATAR_SIZE
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('canvas'))
      ctx.drawImage(
          img,
          (img.naturalWidth - side) / 2,
          (img.naturalHeight - side) / 2,
          side,
          side,
          0,
          0,
          AVATAR_SIZE,
          AVATAR_SIZE,
      )
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('load'))
    }
    img.src = url
  })
}

async function onAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // تا انتخاب دوباره‌ی همون فایل هم change بده
  if (!file) return
  avatarError.value = null
  if (!file.type.startsWith('image/')) {
    avatarError.value = msgRef('auth.profile.avatar.notImage')
    return
  }
  if (file.size > AVATAR_MAX_FILE_BYTES) {
    avatarError.value = msgRef('auth.profile.avatar.tooLarge', { max: AVATAR_MAX_FILE_BYTES / 1024 / 1024 })
    return
  }
  try {
    form.avatar = await resizeToAvatar(file)
  } catch {
    avatarError.value = msgRef('auth.profile.avatar.unreadable')
  }
}

function removeAvatar() {
  form.avatar = ''
  avatarError.value = null
}

async function save() {
  if (saving.value) return
  formError.value = null
  errors.displayName = validateDisplayName(form.displayName) ?? undefined
  errors.email = validateEmail(form.email) ?? undefined
  errors.nationalId = validateNationalId(form.nationalId) ?? undefined
  errors.yearsPlaying = validateYears(form.yearsPlaying) ?? undefined
  if (errors.displayName || errors.email || errors.nationalId || errors.yearsPlaying) return

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
  errors.email = undefined
  errors.nationalId = undefined
  errors.yearsPlaying = undefined
  avatarError.value = null
  formError.value = null
}

// اول logout (تا کوکی تا وقتی صفحه mount هست پاک بشه)، بعد رفتن به خانه.
// loggingOut جلوی ریدایرکت watch پایین به /login رو می‌گیره.
function onLogout() {
  loggingOut.value = true
  logout()
  navigateTo('/')
}
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-8">
    <div v-if="!user" class="py-16 text-stone-400" role="status">{{ t('auth.profile.loading') }}</div>

    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="relative shrink-0">
            <img
                v-if="form.avatar"
                :src="form.avatar"
                :alt="t('auth.profile.photoAlt')"
                class="size-20 rounded-full object-cover"
            />
            <div
                v-else
                class="flex size-20 items-center justify-center rounded-full bg-key-active text-3xl font-semibold text-stone-950"
                aria-hidden="true"
            >
              {{ user.profile.displayName.trim().charAt(0).toUpperCase() || '?' }}
            </div>

            <button
                type="button"
                class="absolute -bottom-1 -end-1 flex size-7 items-center justify-center rounded-full border border-stone-700 bg-stone-900 text-stone-200 shadow transition-colors hover:border-key-active hover:text-key-active focus:outline-none focus-visible:ring-2 focus-visible:ring-key-active/60"
                :aria-label="t('auth.profile.changePhoto')"
                :title="t('auth.profile.changePhoto')"
                @click="pickAvatar"
            >
              <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>

            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                tabindex="-1"
                aria-hidden="true"
                @change="onAvatarChange"
            />
          </div>
          <div>
            <h1 class="text-2xl font-semibold">{{ user.profile.displayName || t('auth.profile.defaultName') }}</h1>
            <p class="text-sm text-stone-400" dir="ltr">{{ user.phone }}</p>
            <button
                v-if="form.avatar"
                type="button"
                class="mt-1 text-xs text-stone-400 hover:text-key-active"
                @click="removeAvatar"
            >
              {{ t('auth.profile.removePhoto') }}
            </button>
            <p v-if="avatarError" class="mt-1 text-xs text-red-400" role="alert">{{ tr(avatarError) }}</p>
          </div>
        </div>

        <button
            type="button"
            class="rounded-md border border-stone-700 px-3 py-2 text-sm hover:bg-stone-800"
            @click="showLogoutConfirm = true"
        >
          {{ t('auth.profile.logout') }}
        </button>
      </div>

      <section class="glass-card relative mt-8 p-5" aria-labelledby="completion-title">
        <div class="flex items-baseline justify-between">
          <h2 id="completion-title" class="text-sm font-medium">{{ t('auth.profile.completion') }}</h2>
          <span class="text-sm text-stone-400">{{ n(completion / 100, 'percent') }}</span>
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
        <p v-if="completion < 100" class="mt-2 text-xs text-stone-400">{{ t('auth.profile.fillRest') }}</p>
        <p v-else class="mt-2 text-xs text-stone-400">{{ t('auth.profile.complete') }}</p>
      </section>

      <form class="mt-8 space-y-8" novalidate @submit.prevent="save">
        <section aria-labelledby="about-title" class="space-y-5">
          <h2 id="about-title" class="border-b border-stone-800 pb-2 text-lg font-medium">{{ t('auth.profile.sections.about') }}</h2>

          <div class="grid gap-5 sm:grid-cols-2">
            <UiTextField
                v-model="form.displayName"
                :label="t('auth.profile.fields.name')"
                autocomplete="nickname"
                :maxlength="DISPLAY_NAME_MAX"
                :error="tr(errors.displayName)"
            />

            <UiTextField
                v-model="form.email"
                :label="t('auth.profile.fields.email')"
                ltr
                type="email"
                inputmode="email"
                autocomplete="email"
                :maxlength="EMAIL_MAX"
                placeholder="you@example.com"
                :error="tr(errors.email)"
            />

            <UiTextField v-model="form.country" :label="t('auth.profile.fields.country')" autocomplete="country-name" :maxlength="60" />

            <UiTextField
                v-model="form.nationalId"
                :label="t('auth.profile.fields.nationalId')"
                ltr
                inputmode="numeric"
                autocomplete="off"
                :maxlength="10"
                :placeholder="t('auth.profile.fields.nationalIdPlaceholder')"
                :error="tr(errors.nationalId)"
            />

            <UiTextField
                v-model="form.address"
                :label="t('auth.profile.fields.address')"
                multiline
                :rows="3"
                autocomplete="street-address"
                :maxlength="ADDRESS_MAX"
                :hint="`${n(form.address.length)} / ${n(ADDRESS_MAX)}`"
                class="sm:col-span-2"
            />
          </div>
        </section>

        <section aria-labelledby="piano-title" class="space-y-5">
          <h2 id="piano-title" class="border-b border-stone-800 pb-2 text-lg font-medium">{{ t('auth.profile.sections.piano') }}</h2>

          <UiTextField
              v-model="form.yearsPlaying"
              :label="t('auth.profile.fields.yearsPlaying')"
              ltr
              type="number"
              :hint="t('auth.profile.fields.yearsHint')"
              :error="tr(errors.yearsPlaying)"
          />
        </section>

        <section aria-labelledby="account-title" class="space-y-2">
          <h2 id="account-title" class="border-b border-stone-800 pb-2 text-lg font-medium">{{ t('auth.profile.sections.account') }}</h2>
          <dl class="grid gap-x-6 gap-y-2 pt-2 text-sm sm:grid-cols-[8rem_1fr]">
            <dt class="text-stone-400">{{ t('auth.profile.fields.mobile') }}</dt>
            <dd dir="ltr">{{ user.phone }}</dd>
            <dt class="text-stone-400">{{ t('auth.profile.fields.memberSince') }}</dt>
            <dd>{{ memberSince }}</dd>
          </dl>
        </section>

        <div class="flex flex-wrap items-center gap-3">
          <button
              type="submit"
              class="rounded-lg bg-key-active px-5 py-3 font-medium text-stone-950 transition-opacity hover:opacity-90 disabled:opacity-60"
              :disabled="saving || !dirty"
          >
            {{ saving ? t('auth.profile.actions.saving') : t('auth.profile.actions.save') }}
          </button>
          <button
              v-if="dirty"
              type="button"
              class="rounded-lg px-4 py-3 text-sm text-stone-300 hover:text-key-active"
              @click="revert"
          >
            {{ t('auth.profile.actions.discard') }}
          </button>
          <span v-if="saved" class="text-sm text-stone-300" role="status">{{ t('auth.profile.actions.saved') }}</span>
          <span v-if="formError" class="text-sm text-red-400" role="alert">{{ tr(formError) }}</span>
        </div>
      </form>
    </template>

    <UiConfirmDialog
        v-model="showLogoutConfirm"
        :title="t('auth.profile.logoutDialog.title')"
        :message="t('auth.profile.logoutDialog.message')"
        :confirm-label="t('auth.profile.logoutDialog.confirm')"
        :cancel-label="t('auth.profile.logoutDialog.cancel')"
        @confirm="onLogout"
    />
  </main>
</template>