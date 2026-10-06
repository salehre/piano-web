<script setup lang="ts">
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
}>()

const model = defineModel<string>({ required: true })

const id = useId()
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
          data-cuelume-type
          :aria-invalid="!!error"
          :aria-describedby="error || hint ? `${id}-msg` : undefined"
      />
      <input
          v-else
          :id="id"
          v-model="model"
          :type="inputType"
          :autocomplete="autocomplete"
          :inputmode="inputmode"
          :maxlength="maxlength"
          :placeholder="placeholder"
          :class="[fieldClass, isPassword ? 'pr-11' : '']"
          data-cuelume-type
          :aria-invalid="!!error"
          :aria-describedby="error || hint ? `${id}-msg` : undefined"
      />

      <button
          v-if="isPassword"
          type="button"
          class="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-stone-400 hover:text-stone-100"
          :aria-label="reveal ? 'Hide password' : 'Show password'"
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