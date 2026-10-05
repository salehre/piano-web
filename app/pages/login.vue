<script setup lang="ts">
definePageMeta({ middleware: 'guest', layout: false })
useHead({ title: 'Log in | Web Piano' })

/**
 * ورود و ثبت‌نام توی یک صفحه، فقط با موبایل:
 *  phone → (حساب با رمز داره؟) password → ورود
 *        → (حساب نداره)        code → newPassword → ورود
 *  password → «Forgot password?» → code → newPassword → ورود
 */
type Step = 'phone' | 'password' | 'code' | 'newPassword'

const route = useRoute()
const { lookup, requestCode, verifyCode, setPassword, login } = useAuth()

const step = ref<Step>('phone')
const isReset = ref(false) // کد برای فراموشی رمزه، نه ثبت‌نام
const form = reactive({ phone: '', password: '', code: '', newPassword: '' })
const error = ref('')
const submitting = ref(false)
const devCode = ref('')
const resendIn = ref(0)

// عکس پس‌زمینه: فایل رو بذار توی public/images/ و فقط اسمش رو همین‌جا عوض کن
const BG_IMAGE = '/images/download.webp'
const bgEl = ref<HTMLImageElement>()
const bgFailed = ref(false) // عکس نبود → بدون آیکون خراب، فقط زمینه‌ی ساده
onMounted(() => {
  // اگه خطا قبل از hydrate اتفاق افتاده باشه، رویداد error رو از دست داده‌ایم
  if (bgEl.value?.complete && bgEl.value.naturalWidth === 0) bgFailed.value = true
})

const redirectTo = computed(() => getSafeRedirect(route.query.redirect))
const formEl = ref<HTMLFormElement>()

// ---------- تایمر ارسال مجدد کد ----------
let timer: ReturnType<typeof setInterval> | undefined
function startCooldown() {
  clearInterval(timer)
  resendIn.value = OTP_RESEND_SECONDS
  timer = setInterval(() => {
    resendIn.value--
    if (resendIn.value <= 0) clearInterval(timer)
  }, 1000)
}
onBeforeUnmount(() => clearInterval(timer))

// رفتن به مرحله‌ی بعد و گذاشتن فوکوس روی فیلد
async function goTo(next: Step) {
  step.value = next
  error.value = ''
  await nextTick()
  formEl.value?.querySelector('input')?.focus()
}

async function sendCode(reset: boolean) {
  const result = await requestCode(form.phone)
  if (!result.ok) {
    error.value = result.error
    return
  }
  isReset.value = reset
  devCode.value = result.devCode ?? ''
  form.code = ''
  startCooldown()
  await goTo('code')
}

// ---------- مراحل ----------
async function submitPhone() {
  const invalid = validatePhone(form.phone)
  if (invalid) return void (error.value = invalid)
  form.phone = normalizePhone(form.phone)

  if (lookup(form.phone).hasPassword) {
    form.password = ''
    await goTo('password')
  } else {
    await sendCode(false)
  }
}

async function submitPassword() {
  if (!form.password) return void (error.value = 'Password is required.')
  const result = await login({ phone: form.phone, password: form.password })
  if (!result.ok) return void (error.value = result.error)
  await navigateTo(redirectTo.value)
}

async function submitCode() {
  if (form.code.length !== OTP_LENGTH) return void (error.value = `Enter the ${OTP_LENGTH}-digit code.`)
  const result = await verifyCode(form.phone, form.code)
  if (!result.ok) return void (error.value = result.error)
  form.newPassword = ''
  await goTo('newPassword')
}

async function submitNewPassword() {
  const invalid = validatePassword(form.newPassword)
  if (invalid) return void (error.value = invalid)
  const result = await setPassword(form.phone, form.newPassword)
  if (!result.ok) return void (error.value = result.error)
  // کاربر جدید می‌ره پروفایلش رو کامل کنه
  await navigateTo(result.isNew ? '/profile' : redirectTo.value)
}

const handlers: Record<Step, () => Promise<void>> = {
  phone: submitPhone,
  password: submitPassword,
  code: submitCode,
  newPassword: submitNewPassword,
}

async function submit() {
  if (submitting.value) return
  error.value = ''
  submitting.value = true
  try {
    await handlers[step.value]()
  } finally {
    submitting.value = false
  }
}

async function resend() {
  if (resendIn.value > 0 || submitting.value) return
  submitting.value = true
  error.value = ''
  await sendCode(isReset.value)
  submitting.value = false
}

async function forgotPassword() {
  if (submitting.value) return
  submitting.value = true
  error.value = ''
  await sendCode(true)
  submitting.value = false
}

// فقط رقم نگه می‌داره و وقتی کد کامل شد خودش ارسال می‌کنه
watch(
    () => form.code,
    (value) => {
      const digits = normalizeDigits(value).replace(/\D/g, '').slice(0, OTP_LENGTH)
      if (digits !== value) form.code = digits
      else if (digits.length === OTP_LENGTH && step.value === 'code') submit()
    },
)

// تایپ‌کردن خطا رو پاک می‌کنه
watch(form, () => {
  error.value = ''
})

const copy = computed(() => {
  switch (step.value) {
    case 'phone':
      return { title: 'Log in or sign up', hint: 'Enter your mobile number to continue.', button: 'Continue' }
    case 'password':
      return { title: 'Welcome back', hint: 'Enter your password to log in.', button: 'Log in' }
    case 'code':
      return { title: 'Enter the code', hint: `We sent a ${OTP_LENGTH}-digit code to ${form.phone}.`, button: 'Verify' }
    default:
      return {
        title: isReset.value ? 'Choose a new password' : 'Choose a password',
        hint: 'You will use it to log in next time.',
        button: isReset.value ? 'Save and log in' : 'Create account',
      }
  }
})
</script>

<template>
  <main
      class="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-stone-950 px-6 py-12"
  >
    <!-- لایه‌ی پشتی: همان عکس، بزرگ‌شده و تار، فقط برای پر کردن فضای خالی دور عکس اصلی -->
    <div
        v-if="!bgFailed"
        class="absolute inset-0 -z-30 scale-110 bg-cover bg-center blur-2xl"
        :style="{ backgroundImage: `url(${BG_IMAGE})` }"
        aria-hidden="true"
    />
    <!-- عکس اصلی بدون زوم و بدون برش (object-contain)؛ اگه خواستی دوباره تمام‌صفحه بشه، object-cover بذار -->
    <img
        v-if="!bgFailed"
        ref="bgEl"
        :src="BG_IMAGE"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 -z-20 h-full w-full select-none object-cover object-center"
        @error="bgFailed = true"
    />
    <!-- لایه‌ی تیره روی عکس؛ اگه عکس نبود فقط همین گرادینت دیده می‌شه -->
    <div
        class="absolute inset-0 -z-10 bg-linear-to-b from-stone-950/40 via-stone-950/25 to-stone-950/70"
        aria-hidden="true"
    />

    <section
        class="glass-card relative w-full max-w-md p-6 sm:p-8"
        aria-labelledby="login-title"
    >
      <header class="border-b border-stone-800 pb-5">
        <h1 id="login-title" class="text-2xl font-semibold">{{ copy.title }}</h1>
        <p class="mt-1.5 text-sm text-stone-400">{{ copy.hint }}</p>
      </header>

      <form ref="formEl" class="mt-6 space-y-5" novalidate @submit.prevent="submit">
        <UiTextField
            v-if="step === 'phone'"
            v-model="form.phone"
            label="Mobile number"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="09123456789"
            :error="error"
        />

        <template v-else-if="step === 'password'">
          <UiTextField
              v-model="form.password"
              label="Password"
              type="password"
              autocomplete="current-password"
              :error="error"
          />
          <button
              type="button"
              class="text-sm text-key-active underline-offset-2 hover:underline disabled:opacity-60"
              :disabled="submitting"
              @click="forgotPassword"
          >
            Forgot your password? Log in with a code
          </button>
        </template>

        <template v-else-if="step === 'code'">
          <p v-if="devCode" class="rounded-md bg-stone-900 px-3 py-2 text-xs text-stone-300" role="status">
            Dev mode: no SMS is sent. Your code is <span class="font-mono text-key-active">{{ devCode }}</span>
          </p>
          <UiTextField
              v-model="form.code"
              label="Verification code"
              inputmode="numeric"
              autocomplete="one-time-code"
              :maxlength="OTP_LENGTH"
              placeholder="123456"
              :error="error"
          />
          <button
              type="button"
              class="text-sm text-key-active underline-offset-2 hover:underline disabled:text-stone-400 disabled:no-underline"
              :disabled="resendIn > 0 || submitting"
              @click="resend"
          >
            {{ resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code' }}
          </button>
        </template>

        <UiTextField
            v-else
            v-model="form.newPassword"
            label="Password"
            type="password"
            autocomplete="new-password"
            :hint="`At least ${PASSWORD_MIN} characters, with a letter and a number.`"
            :error="error"
        />

        <button
            type="submit"
            class="w-full rounded-lg bg-key-active px-5 py-3 font-medium text-stone-950 transition-opacity hover:opacity-90 disabled:opacity-60"
            :disabled="submitting"
        >
          {{ submitting ? 'Please wait…' : copy.button }}
        </button>

        <button
            v-if="step === 'password' || step === 'code'"
            type="button"
            class="w-full text-sm text-stone-400 hover:text-key-active"
            @click="goTo('phone')"
        >
          Use a different number
        </button>
      </form>
    </section>
  </main>
</template>