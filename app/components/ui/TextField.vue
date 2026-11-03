<script setup lang="ts">
import { toast } from 'vue-sonner'

const props = defineProps<{
  label: string
  type?: string
  autocomplete?: string
  inputmode?: 'text' | 'numeric' | 'tel' | 'email'
  error?: string
  hint?: string
  placeholder?: string
  maxlength?: number
  multiline?: boolean
  rows?: number
  ltr?: boolean
  filter?: 'phone' | 'digits' | 'email' | 'password' | 'name'
}>()

const model = defineModel<string>({ required: true })

const { t } = useI18n()
const id = useId()

const REJECT_MESSAGE = {
  phone: 'onlyDigits',
  digits: 'onlyDigits',
  email: 'onlyEnglish',
  password: 'onlyEnglish',
  name: 'onlyLetters',
} as const

function applyClean(el: HTMLInputElement) {
  const kind = props.filter
  if (!kind) return void (model.value = el.value)
  const raw = el.value
  const { value, rejected } = applyFilter(kind, raw, props.maxlength)
  if (value !== raw) {
    const caret = el.selectionStart
    el.value = value
    if (caret !== null) {
      const pos = applyFilter(kind, raw.slice(0, caret), props.maxlength).value.length
      try {
        el.setSelectionRange(pos, pos)
      } catch {
      }
    }
    if (rejected) toast.error(t(`toast.${REJECT_MESSAGE[kind]}`), { id: `filter-${id}`, duration: 2500 })
  }
  model.value = value
}

function onInput(e: Event) {
  // وسط composition (کیبورد IME) دست نمی‌زنیم؛ بعد از تموم شدنش تمیز می‌شه
  if ((e as InputEvent).isComposing) return
  applyClean(e.target as HTMLInputElement)
}
function onCompositionEnd(e: CompositionEvent) {
  applyClean(e.target as HTMLInputElement)
}
const reveal = ref(false)
const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => (isPassword.value && reveal.value ? 'text' : (props.type ?? 'text')))

const fieldClass = computed(() => [
  'w-full rounded-md border bg-stone-900 px-3 py-2 text-sm placeholder:text-stone-500 focus:outline-none focus:ring-2',
  props.error
      ? 'border-red-400 focus:ring-red-400/40'
      : 'border-stone-700 focus:border-key-active focus:ring-key-active/40',
])
</script>

<template>
  <div>
    <label :for="id" class="mb-1.5 block text-sm font-medium">{{ label }}</label>

    <div class="relative">
      <textarea
          v-if="multiline"
          :id="id"
          v-model="model"
          :rows="rows ?? 4"
          :maxlength="maxlength"
          :placeholder="placeholder"
          :class="fieldClass"
          :dir="ltr ? 'ltr' : undefined"
          data-cuelume-type
          :aria-invalid="!!error"
          :aria-describedby="error || hint ? `${id}-msg` : undefined"
      />
      <input
          v-else
          :id="id"
          :value="model"
          :type="inputType"
          :autocomplete="autocomplete"
          :inputmode="inputmode"
          :maxlength="maxlength"
          :placeholder="placeholder"
          :class="[fieldClass, isPassword ? 'pe-11' : '']"
          :dir="ltr ? 'ltr' : undefined"
          data-cuelume-type
          :aria-invalid="!!error"
          :aria-describedby="error || hint ? `${id}-msg` : undefined"
          @input="onInput"
          @compositionend="onCompositionEnd"
      />

      <button
          v-if="isPassword"
          type="button"
          class="absolute inset-y-0 inset-e-0 flex w-11 items-center justify-center text-stone-400 hover:text-stone-100"
          :aria-label="reveal ? t('ui.hidePassword') : t('ui.showPassword')"
          :aria-pressed="reveal"
          data-cuelume-toggle
          data-cuelume-emphasis="subtle"
          @click="reveal = !reveal"
      >
        <!-- eye (نمایش) -->
        <svg v-if="!reveal" xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
             aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <!-- eye-off (مخفی) -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
             aria-hidden="true">
          <path d="M9.9 5.2A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1" />
          <path d="M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.4-1" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
          <path d="m3 3 18 18" />
        </svg>
      </button>
    </div>

    <p v-if="error" :id="`${id}-msg`" class="mt-1 text-sm text-red-400" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-msg`" class="mt-1 text-xs text-stone-400">{{ hint }}</p>
  </div>
</template>