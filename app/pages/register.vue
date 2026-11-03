<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ middleware: 'guest', layout: false })
const { t, n } = useI18n()
const tr = useTr()
useHead({ title: () => t('auth.register.title') })

type Field = 'name' | 'phone' | 'password'

const route = useRoute()
const { lookup, register, updateProfile } = useAuth()

const form = reactive({ name: '', phone: '', password: '' })
const errors = ref<Partial<Record<Field, MessageRef | 'taken'>>>({})
const submitting = ref(false)
const formEl = ref<HTMLFormElement>()

function errorText(field: Field): string {
  const e = errors.value[field]
  if (!e) return ''
  return e === 'taken' ? t('auth.register.phoneTaken') : (tr(e) ?? '')
}

const loginTo = computed(() => ({
  path: '/login',
  query: route.query.redirect ? { redirect: route.query.redirect as string } : undefined,
}))

async function submit() {
  if (submitting.value) return
  errors.value = {}

  const next: Partial<Record<Field, MessageRef | 'taken'>> = {}
  const nameError = validateDisplayName(form.name)
  if (nameError) next.name = nameError
  const phoneError = validatePhone(form.phone)
  if (phoneError) next.phone = phoneError
  else if (lookup(form.phone).hasPassword) next.phone = 'taken'
  const passwordError = validatePassword(form.password)
  if (passwordError) next.password = passwordError
  if (Object.keys(next).length) {
    errors.value = next
    formEl.value?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()
    return
  }

  submitting.value = true
  try {
    const result = await register(form.phone, form.password)
    if (!result.ok) {
      errors.value = { password: result.error }
      return
    }
    // نام همون لحظه توی پروفایل ذخیره می‌شه
    await updateProfile(createEmptyProfile(form.name.trim()))
    toast.success(t('toast.registered'))
    await navigateTo('/profile')
  } finally {
    submitting.value = false
  }
}

// تایپ‌کردن توی هر فیلد، خطای همون فیلد رو پاک می‌کنه
watch(() => form.name, () => delete errors.value.name)
watch(() => form.phone, () => delete errors.value.phone)
watch(() => form.password, () => delete errors.value.password)
</script>

<template>
  <AuthShell :title="t('auth.register.title')" :hint="t('auth.register.hint')">
    <form ref="formEl" class="mt-7 space-y-5" novalidate @submit.prevent="submit">
      <UiTextField
          v-model="form.name"
          :label="t('auth.profile.fields.name')"
          autocomplete="name"
          filter="name"
          :maxlength="DISPLAY_NAME_MAX"
          :error="errorText('name')"
      />
      <UiTextField
          v-model="form.phone"
          :label="t('auth.login.mobileLabel')"
          ltr
          type="tel"
          inputmode="tel"
          filter="phone"
          autocomplete="tel"
          placeholder="09123456789"
          :error="errorText('phone')"
      />
      <UiTextField
          v-model="form.password"
          :label="t('auth.login.passwordLabel')"
          ltr
          type="password"
          filter="password"
          autocomplete="new-password"
          :hint="t('auth.login.passwordHint', { min: n(PASSWORD_MIN) })"
          :error="errorText('password')"
      />

      <button
          type="submit"
          class="w-full rounded-lg bg-key-active px-5 py-3 font-medium text-stone-950 transition-opacity hover:opacity-90 disabled:opacity-60"
          :disabled="submitting"
      >
        {{ submitting ? t('ui.pleaseWait') : t('auth.register.button') }}
      </button>

      <div class="border-t border-stone-800 pt-5 text-center">
        <NuxtLink :to="loginTo" class="text-sm text-stone-400 transition-colors hover:text-key-active">
          {{ t('auth.register.backToLogin') }}
        </NuxtLink>
      </div>
    </form>
  </AuthShell>
</template>