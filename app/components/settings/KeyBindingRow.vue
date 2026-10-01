<script setup lang="ts">
const props = defineProps<{ note: string; code: string | null; error?: string }>()
const emit = defineEmits<{
  'update:code': [code: string]
  clear: []
}>()

const capturing = ref(false)
const isBlack = computed(() => props.note.includes('#'))

// وقتی روی دکمه کلیک شد، اولین کلیدی که زده بشه ثبت می‌شه (Esc = انصراف)
function onKeydown(e: KeyboardEvent) {
  if (!capturing.value) return
  e.preventDefault()
  e.stopPropagation()
  if (MODIFIER_CODES.has(e.code)) return
  if (e.code !== 'Escape') emit('update:code', e.code)
  capturing.value = false
  ;(e.currentTarget as HTMLElement).blur()
}
</script>

<template>
  <li class="py-2">
    <div class="flex items-center gap-2">
      <span
        class="w-12 shrink-0 rounded-md px-1 py-1 text-center text-sm font-medium"
        :class="isBlack ? 'bg-stone-800 text-stone-100' : 'bg-stone-200 text-stone-900'"
      >
        {{ note }}
      </span>

      <button
        type="button"
        class="w-20 shrink-0 truncate rounded-md border px-2 py-1.5 text-center text-sm"
        :class="capturing ? 'border-key-active ring-2 ring-key-active/40' : 'border-stone-700 hover:bg-stone-800'"
        :aria-label="`Computer key for ${note}. Click, then press a key.`"
        @click="capturing = true"
        @keydown="onKeydown"
        @blur="capturing = false"
      >
        <span v-if="capturing" class="text-key-active">Press a key…</span>
        <kbd v-else-if="code" class="font-sans">{{ formatKeyCode(code) }}</kbd>
        <span v-else class="text-stone-500">Not set</span>
      </button>

      <button
        type="button"
        class="w-12 shrink-0 rounded-md px-1 py-1.5 text-sm text-stone-400 hover:bg-stone-800 hover:text-stone-100"
        :class="{ invisible: !code }"
        :tabindex="code ? 0 : -1"
        :aria-label="`Clear shortcut for ${note}`"
        @click="emit('clear')"
      >
        Clear
      </button>
    </div>

    <p v-if="error" class="mt-1 text-sm text-red-400" role="alert">{{ error }}</p>
  </li>
</template>