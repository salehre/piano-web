<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
useHead({ title: 'Sign up | Web Piano' })

const route = useRoute()
const { register } = useAuth()

const form = reactive({ displayName: '', email: '', password: '', confirm: '' })
const errors = reactive<{ displayName?: string; email?: string; password?: string; confirm?: string }>({})
const formError = ref('')
const submitting = ref(false)

const loginLink = computed(() => ({
  path: '/login',
  query: route.query.redirect ? { redirect: route.query.redirect } : {},
}))

async function submit() {
  if (submitting.value) return
  formError.value = ''
  errors.displayName = validateDisplayName(form.displayName) ?? undefined
  errors.email = validateEmail(form.email) ?? undefined
  errors.password = validatePassword(form.password) ?? undefined
  errors.confirm = form.confirm === form.password ? undefined : 'Passwords do not match.'
  if (errors.displayName || errors.email || errors.password || errors.confirm) return

  submitting.value = true
  const result = await register(form)
  submitting.value = false

  if (!result.ok) {
    if (result.field) errors[result.field] = result.error
    else formError.value = result.error
    return
  }
  // بعد از ثبت‌نام می‌ره سراغ تکمیل پروفایل
  await navigateTo('/profile')
}
</script>

<template>
  <main class="mx-auto max-w-md px-6 py-12 sm:py-20">
    <h1 class="text-2xl font-semibold">Create your account</h1>
    <p class="mt-1 text-sm text-stone-400">It takes a minute. You can finish your profile afterwards.</p>

    <form class="mt-8 space-y-5" novalidate @submit.prevent="submit">
      <p v-if="formError" class="rounded-md bg-red-950/60 px-3 py-2 text-sm text-red-300" role="alert">
        {{ formError }}
      </p>

      <UiTextField
          v-model="form.displayName"
          label="Name"
          autocomplete="nickname"
          :maxlength="DISPLAY_NAME_MAX"
          :error="errors.displayName"
      />
      <UiTextField v-model="form.email" label="Email" type="email" autocomplete="email" :error="errors.email" />
      <UiTextField
          v-model="form.password"
          label="Password"
          type="password"
          autocomplete="new-password"
          :hint="`At least ${PASSWORD_MIN} characters, with a letter and a number.`"
          :error="errors.password"
      />
      <UiTextField
          v-model="form.confirm"
          label="Confirm password"
          type="password"
          autocomplete="new-password"
          :error="errors.confirm"
      />

      <button
          type="submit"
          class="w-full rounded-lg bg-key-active px-5 py-3 font-medium text-stone-950 transition-opacity hover:opacity-90 disabled:opacity-60"
          :disabled="submitting"
      >
        {{ submitting ? 'Creating account…' : 'Sign up' }}
      </button>
    </form>

    <p class="mt-6 text-sm text-stone-400">
      Already have an account?
      <NuxtLink :to="loginLink" class="text-key-active underline-offset-2 hover:underline">Log in</NuxtLink>
    </p>
  </main>
</template>