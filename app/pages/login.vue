<script setup lang="ts">
definePageMeta({ middleware: 'guest', layout: false })
const { t, n } = useI18n()
const tr = useTr()
useHead({ title: () => t('auth.login.steps.password.button') })

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
const form = reactive({ phone: '', password: '', code: '', newPassword: '', confirmPassword: '' })
const MISMATCH_KEY = 'auth.validation.passwordMismatch'
// خطا به‌صورت ارجاع به پیام نگه داشته می‌شه تا با عوض شدن زبان، خطای روی صفحه هم ترجمه بشه
const error = ref<MessageRef | null>(null)
const submitting = ref(false)
const devCode = ref('')
const resendIn = ref(0)
const codeOk = ref(false) // کد درست بود؛ انیمیشن موفقیت تا رفتن به مرحله‌ی بعد
const otpEl = ref<{ shake: () => void; focus: () => void }>()

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

// رفتن به مرحله‌ی بعد؛ فوکوس بعد از تموم شدن انیمیشن مرحله (focusFirst) انجام می‌شه
async function goTo(next: Step) {
  step.value = next
  error.value = null
  codeOk.value = false
}

function focusFirst() {
  formEl.value?.querySelector('input')?.focus()
}

async function sendCode(reset: boolean) {
  const result = await requestCode(form.phone)
  if (!result.ok) {
    error.value = result.error
    return
  }
  isReset.value = reset
  codeOk.value = false
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
  if (!form.password) return void (error.value = msgRef('auth.validation.passwordRequired'))
  const result = await login({ phone: form.phone, password: form.password })
  if (!result.ok) return void (error.value = result.error)
  await navigateTo(redirectTo.value)
}

async function submitCode() {
  if (form.code.length !== OTP_LENGTH) return void (error.value = msgRef('auth.validation.codeRequired', { length: OTP_LENGTH }))
  const result = await verifyCode(form.phone, form.code)
  if (!result.ok) {
    // کد اشتباه: لرزش، پاک‌کردن باکس‌ها و برگشت فوکوس به اولین باکس
    error.value = result.error
    form.code = ''
    otpEl.value?.shake()
    await nextTick()
    otpEl.value?.focus()
    return
  }
  // کد درست: انیمیشن موفقیت، بعد رفتن به مرحله‌ی بعد
  codeOk.value = true
  await new Promise((resolve) => setTimeout(resolve, 700))
  form.newPassword = ''
  form.confirmPassword = ''
  await goTo('newPassword')
}

async function submitNewPassword() {
  const invalid = validatePassword(form.newPassword)
  if (invalid) return void (error.value = invalid)
  if (form.newPassword !== form.confirmPassword) return void (error.value = msgRef(MISMATCH_KEY))
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
  error.value = null
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
  error.value = null
  await sendCode(isReset.value)
  submitting.value = false
}

async function forgotPassword() {
  if (submitting.value) return
  submitting.value = true
  error.value = null
  await sendCode(true)
  submitting.value = false
}

// فقط رقم نگه می‌داره و وقتی کد کامل شد خودش ارسال می‌کنه
watch(
    () => form.code,
    (value) => {
      const digits = normalizeDigits(value).replace(/\D/g, '').slice(0, OTP_LENGTH)
      if (digits !== value) form.code = digits
      else if (digits) {
        error.value = null
        if (digits.length === OTP_LENGTH && step.value === 'code') submit()
      }
    },
)

// تایپ‌کردن خطا رو پاک می‌کنه (کد جداست: ورودیش توی watch بالا مدیریت می‌شه تا بعد از کد اشتباه، خطا نپره)
watch(
    () => [form.phone, form.password, form.newPassword, form.confirmPassword],
    () => {
      error.value = null
    },
)

const copy = computed(() => {
  // مرحله‌ی رمز جدید برای ثبت‌نام و فراموشی رمز متن جدا داره
  const base = step.value === 'newPassword' && isReset.value ? 'resetPassword' : step.value
  const prefix = `auth.login.steps.${base}`
  return {
    title: t(`${prefix}.title`),
    // شماره با LRI/PDI جدا می‌شه تا توی جمله‌ی راست‌به‌چپ جابه‌جا نشه
    hint: t(`${prefix}.hint`, { length: n(OTP_LENGTH), phone: `\u2066${form.phone}\u2069` }),
    button: t(`${prefix}.button`),
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
        <Transition name="step" mode="out-in" @after-enter="focusFirst">
          <div :key="step" class="space-y-5">
            <UiTextField
                v-if="step === 'phone'"
                v-model="form.phone"
                :label="t('auth.login.mobileLabel')"
                ltr
                type="tel"
                inputmode="tel"
                :maxlength="11"
                autocomplete="tel"
                placeholder="09123456789"
                :error="tr(error)"
            />

            <template v-else-if="step === 'password'">
              <UiTextField
                  v-model="form.password"
                  :label="t('auth.login.passwordLabel')"
                  type="password"
                  autocomplete="current-password"
                  :error="tr(error)"
              />
              <button
                  type="button"
                  class="text-sm text-key-active underline-offset-2 hover:underline disabled:opacity-60"
                  :disabled="submitting"
                  @click="forgotPassword"
              >
                {{ t('auth.login.forgot') }}
              </button>
            </template>

            <template v-else-if="step === 'code'">
              <p v-if="devCode" class="rounded-md bg-stone-900 px-3 py-2 text-xs text-stone-300" role="status">
                <i18n-t keypath="auth.login.devMode" scope="global">
                  <template #code><span class="font-mono text-key-active">{{ devCode }}</span></template>
                </i18n-t>
              </p>
              <UiOtpInput
                  ref="otpEl"
                  v-model="form.code"
                  :label="t('auth.login.codeLabel')"
                  :length="OTP_LENGTH"
                  :error="tr(error)"
                  :success="codeOk"
              />
              <button
                  type="button"
                  class="text-sm text-key-active underline-offset-2 hover:underline disabled:text-stone-400 disabled:no-underline"
                  :disabled="resendIn > 0 || submitting"
                  @click="resend"
              >
                {{ resendIn > 0 ? t('auth.login.resendIn', { seconds: n(resendIn) }) : t('auth.login.resend') }}
              </button>
            </template>

            <template v-else>
              <UiTextField
                  v-model="form.newPassword"
                  :label="t('auth.login.passwordLabel')"
                  type="password"
                  autocomplete="new-password"
                  :hint="t('auth.login.passwordHint', { min: n(PASSWORD_MIN) })"
                  :error="error?.key === MISMATCH_KEY ? '' : tr(error)"
              />
              <UiTextField
                  v-model="form.confirmPassword"
                  :label="t('auth.login.confirmLabel')"
                  type="password"
                  autocomplete="new-password"
                  :error="error?.key === MISMATCH_KEY ? tr(error) : ''"
              />
            </template>
          </div>
        </Transition>

        <button
            v-if="step !== 'code'"
            type="submit"
            class="w-full rounded-lg bg-key-active px-5 py-3 font-medium text-stone-950 transition-opacity hover:opacity-90 disabled:opacity-60"
            :disabled="submitting"
        >
          {{ submitting ? t('ui.pleaseWait') : copy.button }}
        </button>

        <button
            v-if="step === 'password' || step === 'code'"
            type="button"
            class="w-full text-sm text-stone-400 hover:text-key-active"
            @click="goTo('phone')"
        >
          {{ t('auth.login.differentNumber') }}
        </button>
      </form>
    </section>
  </main>
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