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
          :class="[fieldClass, isPassword ? 'pr-16' : '']"
          :aria-invalid="!!error"
          :aria-describedby="error || hint ? `${id}-msg` : undefined"
      />

      <button
          v-if="isPassword"
          type="button"
          class="absolute inset-y-0 right-0 px-3 text-xs text-stone-400 hover:text-stone-100"
          :aria-pressed="reveal"
          @click="reveal = !reveal"
      >
        {{ reveal ? 'Hide' : 'Show' }}
      </button>
    </div>

    <p v-if="error" :id="`${id}-msg`" class="mt-1 text-sm text-red-400" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-msg`" class="mt-1 text-xs text-stone-400">{{ hint }}</p>
  </div>
</template>