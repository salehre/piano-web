<script setup lang="ts">
/**
 * ورودی کد یک‌بارمصرف با یک باکس برای هر رقم.
 * - v-model یک رشته‌ی ارقامه (بدون فاصله‌ی خالی وسطش)
 * - paste و autofill پیامک رو روی همه‌ی باکس‌ها پخش می‌کنه
 * - shake() برای کد اشتباه، success برای انیمیشن کد درست
 */
const props = defineProps<{
  length: number
  label: string
  error?: string
  success?: boolean
}>()

const model = defineModel<string>({ default: '' })

const id = useId()
const boxes = ref<HTMLInputElement[]>([])
const shaking = ref(false)

const digits = computed(() => Array.from({ length: props.length }, (_, i) => model.value[i] ?? ''))
const clean = (raw: string) => normalizeDigits(raw).replace(/\D/g, '')

function focusAt(index: number) {
  const el = boxes.value[Math.max(0, Math.min(index, props.length - 1))]
  el?.focus()
  el?.select()
}

// کاربر نباید بتونه وسط خالی‌ها کلیک کنه؛ فوکوس می‌ره روی اولین باکس خالی
function onFocus(index: number) {
  if (index > model.value.length) focusAt(model.value.length)
  else boxes.value[index]?.select()
}

function onInput(index: number, e: Event) {
  const el = e.target as HTMLInputElement
  const typed = clean(el.value)
  el.value = digits.value[index]
  if (!typed) return
  model.value = (model.value.slice(0, index) + typed + model.value.slice(index + typed.length)).slice(0, props.length)
  nextTick(() => focusAt(index + typed.length))
}

function onKeydown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' || e.key === 'Delete') {
    e.preventDefault()
    const target = digits.value[index] ? index : e.key === 'Backspace' ? index - 1 : -1
    if (target < 0) return
    model.value = model.value.slice(0, target) + model.value.slice(target + 1)
    nextTick(() => focusAt(target))
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    focusAt(index - 1)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    focusAt(Math.min(index + 1, model.value.length))
  }
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = clean(e.clipboardData?.getData('text') ?? '').slice(0, props.length)
  if (!text) return
  model.value = text
  nextTick(() => focusAt(text.length))
}

let shakeTimer: ReturnType<typeof setTimeout> | undefined
function shake() {
  shaking.value = false
  void nextTick(() => {
    shaking.value = true
    clearTimeout(shakeTimer)
    shakeTimer = setTimeout(() => (shaking.value = false), 450)
  })
}
onBeforeUnmount(() => clearTimeout(shakeTimer))

defineExpose({ shake, focus: () => focusAt(model.value.length) })
</script>

<template>
  <div role="group" :aria-labelledby="`${id}-label`">
    <span :id="`${id}-label`" class="mb-1.5 block text-sm font-medium">{{ label }}</span>

    <div
        dir="ltr"
        class="otp-row grid justify-center gap-2"
        :class="{ 'otp-shake': shaking }"
        :style="{ gridTemplateColumns: `repeat(${length}, minmax(0, 3.25rem))` }"
    >
      <input
          v-for="(digit, i) in digits"
          :key="i"
          :ref="(el) => (boxes[i] = el as HTMLInputElement)"
          :value="digit"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          :aria-label="`Digit ${i + 1} of ${length}`"
          :aria-invalid="!!error"
          :readonly="success"
          data-cuelume-type
          class="otp-box aspect-square w-full rounded-lg border bg-stone-900 text-center text-xl font-semibold text-stone-100 outline-none transition-colors focus:border-key-active focus:ring-2 focus:ring-key-active/40"
          :class="[
          success ? 'otp-pop border-key-active bg-key-active/15 text-key-active' : error ? 'border-red-500' : 'border-stone-700',
        ]"
          :style="success ? { animationDelay: `${i * 70}ms` } : undefined"
          @focus="onFocus(i)"
          @input="onInput(i, $event)"
          @keydown="onKeydown(i, $event)"
          @paste="onPaste"
      />
    </div>

    <p v-if="error" class="mt-2 text-center text-sm text-red-400" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.otp-shake {
  animation: otp-shake 0.4s ease-in-out;
}
.otp-pop {
  animation: otp-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes otp-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}
@keyframes otp-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.18); }
  100% { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .otp-shake, .otp-pop { animation: none; }
}
</style>