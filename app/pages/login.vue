<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ middleware: 'guest', layout: false })
const { t, n } = useI18n()
const tr = useTr()
useHead({ title: () => t('auth.login.steps.password.button') })

type Step = 'credentials'

const route = useRoute()
const { login } = useAuth()

const step = ref<Step>('credentials')
const form = reactive({ phone: '', password: '' })
const error = ref<MessageRef | null>(null)
const submitting = ref(false)
const isPhoneError = computed(() => !!error.value?.key.startsWith('auth.validation.phone'))

const redirectTo = computed(() => getSafeRedirect(route.query.redirect))
const formEl = ref<HTMLFormElement>()

function focusFirst() {
  formEl.value?.querySelector('input')?.focus()
}

// لینک «ساخت حساب» redirect اولیه رو حفظ می‌کنه
const registerTo = computed(() => ({
  path: '/register',
  query: route.query.redirect ? { redirect: route.query.redirect as string } : undefined,
}))

// ---------- ورود ----------
async function submitCredentials() {
  const invalid = validatePhone(form.phone)
  if (invalid) return void (error.value = invalid)
  form.phone = normalizePhone(form.phone)
  if (!form.password) return void (error.value = msgRef('auth.validation.passwordRequired'))

  const result = await login({ phone: form.phone, password: form.password })
  if (!result.ok) return void (error.value = result.error)
  toast.success(t('toast.loggedIn'))
  await navigateTo(redirectTo.value)
}

const handlers: Record<Step, () => Promise<void>> = {
  credentials: submitCredentials,
}

async function submit() {
  if (submitting.value) return
  error.value = null
  submitting.value = true
  try {
    await handlers[step.value]()
  } finally {
    submitting.value = false
  }
}

watch(
    () => [form.phone, form.password],
    () => {
      error.value = null
    },
)

const copy = computed(() => ({
  title: t('auth.login.steps.password.title'),
  hint: t('auth.login.hint'),
  button: t('auth.login.steps.password.button'),
}))
</script>

<template>
  <AuthShell :title="copy.title" :hint="copy.hint">
    <form ref="formEl" class="mt-7 space-y-5" novalidate @submit.prevent="submit">
      <Transition name="step" mode="out-in" appear @after-enter="focusFirst">
        <div :key="step" class="space-y-5">
          <UiTextField
              v-model="form.phone"
              :label="t('auth.login.mobileLabel')"
              ltr
              type="tel"
              inputmode="tel"
              filter="phone"
              autocomplete="tel"
              placeholder="09123456789"
              :error="isPhoneError ? tr(error) : ''"
          />
          <UiTextField
              v-model="form.password"
              :label="t('auth.login.passwordLabel')"
              ltr
              type="password"
              autocomplete="current-password"
              :hint="t('auth.login.passwordHint', { min: n(PASSWORD_MIN) })"
              :error="isPhoneError ? '' : tr(error)"
          />

        </div>
      </Transition>

      <button
          type="submit"
          class="w-full rounded-lg bg-key-active px-5 py-3 font-medium text-stone-950 transition-opacity hover:opacity-90 disabled:opacity-60"
          :disabled="submitting"
      >
        {{ submitting ? t('ui.pleaseWait') : copy.button }}
      </button>

      <!-- یا: ساخت حساب جدید -->
      <div class="flex items-center gap-3 text-xs text-stone-500" aria-hidden="true">
        <span class="h-px flex-1 bg-stone-800" />
        {{ t('auth.login.or') }}
        <span class="h-px flex-1 bg-stone-800" />
      </div>
      <NuxtLink
          :to="registerTo"
          class="block w-full rounded-lg border border-stone-700 px-5 py-3 text-center text-sm font-medium transition-colors hover:bg-stone-800/60"
      >
        {{ t('auth.login.createAccount') }}
      </NuxtLink>
    </form>
  </AuthShell>
</template>

<style scoped>
.step-enter-active,
.step-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

@media (prefers-reduced-motion: reduce) {
  .step-enter-active,
  .step-leave-active {
    transition: none;
  }
}
</style>