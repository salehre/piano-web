<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
useHead({ title: 'Log in | Web Piano' })

const route = useRoute()
const { login } = useAuth()

const form = reactive({ email: '', password: '' })
const errors = reactive<{ email?: string; password?: string }>({})
const formError = ref('')
const submitting = ref(false)

// اگه از صفحه‌ی محافظت‌شده اومده باشه، بعد از ورود همون‌جا برمی‌گرده
const redirectTo = computed(() => getSafeRedirect(route.query.redirect))
const registerLink = computed(() => ({
  path: '/register',
  query: route.query.redirect ? { redirect: route.query.redirect } : {},
}))

async function submit() {
  if (submitting.value) return
  formError.value = ''
  errors.email = validateEmail(form.email) ?? undefined
  errors.password = form.password ? undefined : 'Password is required.'
  if (errors.email || errors.password) return

  submitting.value = true
  const result = await login(form)
  submitting.value = false

  if (!result.ok) {
    formError.value = result.error
    return
  }
  await navigateTo(redirectTo.value)
}
</script>

<template>
  <main class="mx-auto max-w-md px-6 py-12 sm:py-20">
    <h1 class="text-2xl font-semibold">Log in</h1>
    <p class="mt-1 text-sm text-stone-400">Welcome back. Log in to manage your profile.</p>

    <form class="mt-8 space-y-5" novalidate @submit.prevent="submit">
      <p v-if="formError" class="rounded-md bg-red-950/60 px-3 py-2 text-sm text-red-300" role="alert">
        {{ formError }}
      </p>

      <UiTextField v-model="form.email" label="Email" type="email" autocomplete="email" :error="errors.email" />
      <UiTextField
          v-model="form.password"
          label="Password"
          type="password"
          autocomplete="current-password"
          :error="errors.password"
      />

      <button
          type="submit"
          class="w-full rounded-lg bg-key-active px-5 py-3 font-medium text-stone-950 transition-opacity hover:opacity-90 disabled:opacity-60"
          :disabled="submitting"
      >
        {{ submitting ? 'Logging in…' : 'Log in' }}
      </button>
    </form>

    <p class="mt-6 text-sm text-stone-400">
      Don't have an account?
      <NuxtLink :to="registerLink" class="text-key-active underline-offset-2 hover:underline">Sign up</NuxtLink>
    </p>
  </main>
</template>