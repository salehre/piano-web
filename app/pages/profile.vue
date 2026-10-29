<script setup lang="ts">
import type { UserProfile } from '~/utils/auth'

definePageMeta({ middleware: 'auth' })
const { t, n, d, locale } = useI18n()
const tr = useTr()
useHead({ title: () => t('nav.profile') })

const { user, ready, updateProfile, logout } = useAuth()
const { devices } = useMidi()
const connectedPianos = computed(() => devices.value.filter(device => device.connected))

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
// برای re-trigger انیمیشن خطا
const formErrorKey = ref(0)
watch(formError, (v) => { if (v) formErrorKey.value++ })

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
  <main class="relative isolate min-h-screen bg-stone-950 px-4 py-8 text-stone-100 sm:px-6 lg:px-8">
    <div
      class="pointer-events-none absolute -top-48 left-1/2 z-0 size-144 -translate-x-1/2 rounded-full bg-key-active/5 blur-3xl animate-breathe"
      aria-hidden="true"
    />

    <div class="relative z-10 mx-auto max-w-6xl">
      <!-- ══════ حالت بارگذاری: کلیدهای پیانو ══════ -->
      <div v-if="!user" class="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-stone-400" role="status">
        <div class="flex h-12 items-end gap-1.5" aria-hidden="true">
          <span v-for="i in 5" :key="i" class="loader-key" :style="{ animationDelay: `${(i - 1) * 120}ms` }" />
        </div>
        <p class="text-sm">{{ t('auth.profile.loading') }}</p>
      </div>

      <template v-else>
        <!-- ══════ کارت هدر ══════ -->
        <section
          class="card-in relative isolate overflow-hidden rounded-[1.75rem] border border-stone-700/40 bg-linear-to-br from-stone-900 via-stone-950 to-stone-900 shadow-2xl shadow-black/30"
        >
          <div class="pointer-events-none absolute -top-24 right-0 size-64 translate-x-1/3 rounded-full bg-key-active/10 blur-3xl" aria-hidden="true" />
          <div class="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-linear-to-l from-white/2.5 to-transparent" aria-hidden="true" />

          <!-- نُت‌های شناور -->
          <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <span class="float-note" style="left: 5%; animation-delay: 0s">♪</span>
            <span class="float-note" style="left: 22%; animation-delay: 3.2s; font-size: 1.1rem">♫</span>
            <span class="float-note" style="left: 68%; animation-delay: 1.6s; font-size: 1.7rem">♩</span>
            <span class="float-note" style="left: 86%; animation-delay: 6s; font-size: 1.2rem">♬</span>
            <span class="float-note" style="left: 45%; animation-delay: 9s; font-size: 0.9rem">♪</span>
          </div>

          <!-- کیبورد پیانو ↓ لبهٔ پایین -->
          <div class="pointer-events-none absolute inset-x-0 bottom-0 flex h-2 gap-px opacity-40" aria-hidden="true">
            <span v-for="i in 30" :key="i" class="piano-key" :style="{ animationDelay: `${i * 60}ms` }" />
          </div>

          <div class="relative flex flex-col gap-6 p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
            <div class="flex min-w-0 items-center gap-4 sm:gap-5">
              <div class="relative shrink-0">
                <div class="size-20 rounded-full bg-linear-to-br from-key-active via-stone-300 to-stone-700 p-0.75 transition-transform duration-300 hover:scale-105 sm:size-24">
                  <Transition name="avatar-fade" mode="out-in">
                    <img
                      v-if="form.avatar"
                      :key="form.avatar"
                      :src="form.avatar"
                      :alt="t('auth.profile.photoAlt')"
                      class="size-full rounded-full border-2 border-stone-900 object-cover"
                    />
                    <div
                      v-else
                      key="placeholder"
                      class="flex size-full items-center justify-center rounded-full border-2 border-stone-900 bg-stone-800 text-3xl font-semibold text-key-active sm:text-4xl"
                      aria-hidden="true"
                    >
                      {{ user.profile.displayName.trim().charAt(0).toUpperCase() || '-' }}
                    </div>
                  </Transition>
                </div>

                <button
                  type="button"
                  class="absolute -bottom-1 -inset-e-1 flex size-8 items-center justify-center rounded-full border border-stone-700 bg-stone-900 text-stone-200 shadow-lg transition hover:scale-110 hover:border-key-active hover:text-key-active focus:outline-none focus-visible:ring-2 focus-visible:ring-key-active/60"
                  :aria-label="t('auth.profile.changePhoto')"
                  :title="t('auth.profile.changePhoto')"
                  @click="pickAvatar"
                >
                  <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>

                <input ref="fileInput" type="file" accept="image/*" class="hidden" tabindex="-1" aria-hidden="true" @change="onAvatarChange" />
              </div>

              <div class="min-w-0">
                <p class="mb-1 text-xs font-semibold tracking-[0.18em] text-key-active">
                  {{ t('nav.profile') }}
                </p>
                <h1 class="truncate text-2xl font-semibold tracking-tight text-stone-100 sm:text-3xl">
                  {{ form.displayName.trim() || t('auth.profile.defaultName') }}
                </h1>
                <p class="mt-2 inline-flex items-center gap-2 text-sm text-stone-400" dir="ltr">
                  <svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M5 4h3l2 5-2 1.5a14 14 0 0 0 5.5 5.5L15 14l5 2v3a2 2 0 0 1-2.2 2A17.8 17.8 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />
                  </svg>
                  {{ user.phone }}
                </p>
                <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <button v-if="form.avatar" type="button" class="text-xs text-stone-400 transition hover:text-key-active" @click="removeAvatar">
                    {{ t('auth.profile.removePhoto') }}
                  </button>
                  <Transition name="fade-up" mode="out-in">
                    <p v-if="avatarError" class="text-xs text-red-400" role="alert">{{ tr(avatarError) }}</p>
                  </Transition>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-stone-700/40 bg-stone-950/10 px-4 text-sm font-medium text-stone-300 transition hover:border-red-400/30 hover:bg-red-400/5 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-key-active/60 sm:w-auto md:self-center"
              @click="showLogoutConfirm = true"
            >
              <svg class="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M10 17l5-5-5-5M15 12H3" />
                <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
              </svg>
              {{ t('auth.profile.logout') }}
            </button>
          </div>
        </section>

        <!-- ══════ گرید اصلی ══════ -->
        <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <aside class="order-1 space-y-5 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1">
            <!-- تکمیل پروفایل -->
            <section
              class="card-in relative overflow-hidden rounded-2xl border border-stone-700/40 bg-stone-900/70 p-5 shadow-xl shadow-black/10"
              style="animation-delay: 80ms"
              aria-labelledby="completion-title"
            >
              <div class="pointer-events-none absolute -inset-e-10 -top-10 size-32 rounded-full bg-key-active/5 blur-2xl" aria-hidden="true" />
              <div class="relative">
                <div class="flex items-center justify-between gap-3">
                  <h2 id="completion-title" class="text-sm font-semibold">{{ t('auth.profile.completion') }}</h2>
                  <span class="rounded-full border border-key-active/20 bg-key-active/10 px-2.5 py-1 text-xs font-semibold text-key-active">
                    {{ n(completion / 100, 'percent') }}
                  </span>
                </div>
                <div
                  class="mt-5 h-2 overflow-hidden rounded-full bg-stone-800"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-valuenow="completion"
                  :aria-valuetext="n(completion / 100, 'percent')"
                >
                  <div class="progress-shimmer h-full rounded-full bg-linear-to-r from-key-active/70 to-key-active transition-[width] duration-700 ease-out" :style="{ width: `${completion}%` }" />
                </div>
                <Transition name="fade-up" mode="out-in">
                  <p v-if="completion < 100" key="incomplete" class="mt-3 text-xs leading-5 text-stone-400">
                    {{ t('auth.profile.fillRest') }}
                  </p>
                  <p v-else key="complete" class="mt-3 text-xs leading-5 text-stone-400">
                    {{ t('auth.profile.complete') }}
                  </p>
                </Transition>
              </div>
            </section>

            <!-- حساب کاربری -->
            <section
              class="card-in rounded-2xl border border-stone-700/40 bg-stone-900/70 p-5 shadow-xl shadow-black/10"
              style="animation-delay: 160ms"
              aria-labelledby="account-title"
            >
              <div class="flex items-center gap-3">
                <span class="flex size-10 items-center justify-center rounded-xl bg-stone-800/50 text-stone-300 ring-1 ring-inset ring-stone-700/50">
                  <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
                    <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9h17" />
                  </svg>
                </span>
                <h2 id="account-title" class="text-sm font-semibold">{{ t('auth.profile.sections.account') }}</h2>
              </div>
              <dl class="mt-4 rounded-xl border border-stone-700/30 bg-stone-950/20 p-4">
                <dt class="text-xs text-stone-500">{{ t('auth.profile.fields.memberSince') }}</dt>
                <dd class="mt-1 text-base font-medium text-stone-200">{{ memberSince }}</dd>
              </dl>
            </section>
          </aside>

          <form class="order-2 min-w-0 space-y-5 lg:col-start-1 lg:row-start-1" novalidate @submit.prevent="save">
            <!-- اطلاعات شخصی -->
            <section
              class="card-in rounded-2xl border border-stone-700/40 bg-stone-900/70 p-5 shadow-xl shadow-black/10 sm:p-6"
              style="animation-delay: 200ms"
              aria-labelledby="about-title"
            >
              <div class="mb-6 flex items-center gap-3">
                <span class="flex size-10 items-center justify-center rounded-xl bg-key-active/10 text-key-active ring-1 ring-inset ring-key-active/20">
                  <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.25" />
                    <path d="M5 20c.8-3.4 3.2-5.1 7-5.1s6.2 1.7 7 5.1" />
                  </svg>
                </span>
                <h2 id="about-title" class="text-lg font-semibold">{{ t('auth.profile.sections.about') }}</h2>
              </div>

              <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <UiTextField v-model="form.displayName" :label="t('auth.profile.fields.name')" autocomplete="nickname" :maxlength="DISPLAY_NAME_MAX" :error="tr(errors.displayName)" />
                <UiTextField v-model="form.email" :label="t('auth.profile.fields.email')" ltr type="email" inputmode="email" autocomplete="email" :maxlength="EMAIL_MAX" :placeholder="t('auth.profile.fields.emailPlaceholder')" :error="tr(errors.email)" />
                <UiTextField v-model="form.country" :label="t('auth.profile.fields.country')" autocomplete="country-name" :maxlength="60" />
                <UiTextField v-model="form.nationalId" :label="t('auth.profile.fields.nationalId')" :ltr="locale === 'en'" inputmode="numeric" autocomplete="off" :maxlength="10" :placeholder="t('auth.profile.fields.nationalIdPlaceholder')" :error="tr(errors.nationalId)" />
                <UiTextField v-model="form.address" :label="t('auth.profile.fields.address')" multiline :rows="3" autocomplete="street-address" :maxlength="ADDRESS_MAX" :hint="`${n(form.address.length)} / ${n(ADDRESS_MAX)}`" class="sm:col-span-2" />
              </div>
            </section>

            <!-- پیانو -->
            <section
              class="card-in rounded-2xl border border-stone-700/40 bg-stone-900/70 p-5 shadow-xl shadow-black/10 sm:p-6"
              style="animation-delay: 280ms"
              aria-labelledby="piano-title"
            >
              <div class="mb-6 flex items-center gap-3">
                <span class="flex size-10 items-center justify-center rounded-xl bg-key-active/10 text-key-active ring-1 ring-inset ring-key-active/20">
                  <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M8 5v8m4-8v8m4-8v8M7 19v-6h10v6" />
                  </svg>
                </span>
                <h2 id="piano-title" class="text-lg font-semibold">{{ t('auth.profile.sections.piano') }}</h2>
              </div>

              <div
                v-if="connectedPianos.length"
                class="mb-5 flex flex-col gap-3 rounded-xl border border-key-active/20 bg-key-active/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span class="flex items-center gap-2.5 text-sm font-medium text-key-active">
                  <span class="relative flex size-2" aria-hidden="true">
                    <span class="ping-ring absolute inset-0 rounded-full bg-key-active" />
                    <span class="relative size-2 rounded-full bg-key-active" />
                  </span>
                  <span>{{ t('settings.midi.connected') }}</span>
                  <span class="flex h-3.5 items-end gap-0.5 text-key-active" aria-hidden="true">
                    <span class="eq-bar" style="animation-delay: 0ms" />
                    <span class="eq-bar" style="animation-delay: 140ms" />
                    <span class="eq-bar" style="animation-delay: 280ms" />
                    <span class="eq-bar" style="animation-delay: 420ms" />
                  </span>
                </span>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="device in connectedPianos"
                    :key="device.id"
                    class="rounded-full border border-stone-700/40 bg-stone-950/20 px-3 py-1 text-xs text-stone-300"
                  >
                    {{ device.name || t('settings.midi.unknownDevice') }}
                  </span>
                </div>
              </div>

              <p v-else class="mb-5 flex items-center gap-2 rounded-xl border border-stone-700/30 bg-stone-950/10 px-4 py-3 text-sm text-stone-400" role="status">
                <span class="size-2 rounded-full bg-stone-600 ring-4 ring-stone-600/10" aria-hidden="true" />
                {{ t('settings.midi.disconnected') }}
              </p>

              <UiTextField
                v-model="form.yearsPlaying"
                :label="t('auth.profile.fields.yearsPlaying')"
                ltr
                type="number"
                :hint="t('auth.profile.fields.yearsHint')"
                :error="tr(errors.yearsPlaying)"
              />
            </section>

            <!-- نوار ذخیره -->
            <div
              class="card-in flex flex-wrap items-center gap-3 rounded-2xl border border-stone-700/30 bg-stone-900/20 p-3 sm:p-4"
              style="animation-delay: 360ms"
            >
              <button
                type="submit"
                :class="[
                  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-key-active px-5 font-semibold text-stone-950 shadow-lg shadow-key-active/10 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-key-active/60',
                  dirty && !saving && !saved ? 'btn-pulse' : '',
                ]"
                :disabled="saving || !dirty"
              >
                <Transition name="icon-swap" mode="out-in">
                  <svg v-if="saved && !dirty" key="saved" class="check-pop size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                  <svg v-else-if="!saving" key="check" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M5 12.5 9.5 17 19 7.5" />
                  </svg>
                  <span v-else key="spinner" class="spinner size-4" aria-hidden="true" />
                </Transition>
                <span>{{ saving ? t('auth.profile.actions.saving') : t('auth.profile.actions.save') }}</span>
              </button>

              <Transition name="fade-up" mode="out-in">
                <button v-if="dirty" key="discard" type="button" class="min-h-11 rounded-xl px-4 text-sm text-stone-400 transition hover:bg-stone-800/50 hover:text-stone-100" @click="revert">
                  {{ t('auth.profile.actions.discard') }}
                </button>
              </Transition>

              <Transition name="fade-up" mode="out-in">
                <span v-if="saved" key="saved" class="inline-flex items-center gap-2 text-sm text-key-active" role="status">
                  <svg class="check-pop size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                  {{ t('auth.profile.actions.saved') }}
                </span>
              </Transition>

              <Transition name="fade-up" mode="out-in">
                <span v-if="formError" :key="formErrorKey" class="text-sm text-red-400" role="alert">
                  {{ tr(formError) }}
                </span>
              </Transition>
            </div>
          </form>
        </div>
      </template>
    </div>

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

<style scoped>
/* ───── پس‌زمینه: نفس‌کشیدن آرام ───── */
@keyframes breathe {
  0%, 100% { opacity: 0.35; transform: translateX(-50%) scale(1); }
  50%      { opacity: 0.65; transform: translateX(-50%) scale(1.08); }
}
.animate-breathe { animation: breathe 12s ease-in-out infinite; }

/* ───── بارگذاری: کلیدهای پیانو ───── */
.loader-key {
  display: block;
  width: 10px;
  height: 44px;
  border-radius: 2px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-key-active) 55%, white), var(--color-key-active));
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-key-active) 25%, transparent);
  transform-origin: bottom;
  animation: key-bounce 1.2s ease-in-out infinite;
}
@keyframes key-bounce {
  0%, 100% { transform: scaleY(0.35); opacity: 0.4; }
  50%      { transform: scaleY(1);    opacity: 1;   }
}

/* ───── ورود پله‌ای کارت‌ها ───── */
@keyframes card-in {
  from { opacity: 0; transform: translateY(18px); filter: blur(3px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
}
.card-in {
  animation: card-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ───── نُت‌های شناور ───── */
.float-note {
  position: absolute;
  bottom: -2rem;
  font-size: 1.4rem;
  line-height: 1;
  color: color-mix(in srgb, var(--color-key-active) 18%, transparent);
  user-select: none;
  animation: note-float 14s linear infinite;
  will-change: transform, opacity;
}
@keyframes note-float {
  0%   { transform: translate3d(0, 0, 0) rotate(-8deg);  opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 1; }
  100% { transform: translate3d(20px, -230px, 0) rotate(12deg); opacity: 0; }
}

/* ───── نوار کلیدهای پیانو ───── */
.piano-key {
  flex: 1;
  min-width: 4px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-key-active) 65%, transparent) 0%, color-mix(in srgb, var(--color-key-active) 8%, transparent) 100%);
  border-radius: 1px;
  transform-origin: bottom;
  animation: key-wave 3.5s ease-in-out infinite;
}
@keyframes key-wave {
  0%, 100% { transform: scaleY(0.35); opacity: 0.3;  }
  50%      { transform: scaleY(1);    opacity: 0.75; }
}

/* ───── آواتار ───── */
.avatar-fade-enter-active { transition: opacity 0.28s ease, transform 0.28s ease; }
.avatar-fade-leave-active { transition: opacity 0.18s ease; }
.avatar-fade-enter-from   { opacity: 0; transform: scale(0.9); }
.avatar-fade-leave-to     { opacity: 0; }

/* ───── درخشش موجی نوار پیشرفت ───── */
.progress-shimmer { position: relative; overflow: hidden; }
.progress-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.55) 50%, transparent 100%);
  transform: translateX(-100%);
  animation: shimmer 2.4s ease-in-out infinite;
}
@keyframes shimmer { to { transform: translateX(100%); } }

/* ───── MIDI متصل: پالس + اکولایزر ───── */
.ping-ring { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
@keyframes ping {
  0%       { transform: scale(1);   opacity: 0.7; }
  80%,100% { transform: scale(2.4); opacity: 0;   }
}

.eq-bar {
  display: inline-block;
  width: 2.5px;
  height: 4px;
  border-radius: 9999px;
  background: currentColor;
  animation: eq-bounce 0.9s ease-in-out infinite;
}
@keyframes eq-bounce {
  0%, 100% { transform: scaleY(0.4); }
  50%      { transform: scaleY(1);   }
}

/* ───── دکمهٔ ذخیره ───── */
@keyframes btn-pulse {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-key-active) 40%, transparent), 0 10px 15px -3px color-mix(in srgb, var(--color-key-active) 10%, transparent); }
  50%      { box-shadow: 0 0 0 8px transparent, 0 10px 15px -3px color-mix(in srgb, var(--color-key-active) 10%, transparent); }
}
.btn-pulse { animation: btn-pulse 2.4s ease-in-out infinite; }

/* ───── اسپینر ───── */
.spinner {
  display: inline-block;
  border-radius: 9999px;
  border: 2px solid color-mix(in srgb, var(--color-stone-950) 30%, transparent);
  border-top-color: var(--color-stone-950);
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ───── تیک بعد از ذخیره ───── */
@keyframes check-pop {
  0%   { transform: scale(0.4) rotate(-25deg); opacity: 0; }
  60%  { transform: scale(1.15) rotate(5deg);  opacity: 1; }
  100% { transform: scale(1)    rotate(0); }
}
.check-pop { animation: check-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

/* ───── ترنزیشن‌های Vue ───── */
.fade-up-enter-active { transition: opacity 0.28s ease, transform 0.28s ease; }
.fade-up-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.fade-up-enter-from   { opacity: 0; transform: translateY(6px);  }
.fade-up-leave-to     { opacity: 0; transform: translateY(-4px); }

.icon-swap-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.icon-swap-leave-active { transition: opacity 0.14s ease, transform 0.14s ease; }
.icon-swap-enter-from   { opacity: 0; transform: scale(0.6) rotate(-40deg); }
.icon-swap-leave-to     { opacity: 0; transform: scale(0.6) rotate(40deg);  }

/* ───── احترام به prefers-reduced-motion ───── */
@media (prefers-reduced-motion: reduce) {
  .animate-breathe,
  .card-in,
  .float-note,
  .piano-key,
  .loader-key,
  .progress-shimmer::after,
  .ping-ring,
  .eq-bar,
  .btn-pulse,
  .spinner,
  .check-pop {
    animation: none !important;
  }
  :deep(*) { transition-duration: 0.01ms !important; }
}
</style>