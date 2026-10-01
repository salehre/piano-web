<script setup lang="ts">
import type { KeyBinding } from '~/utils/keyboard'

defineProps<{ binding: KeyBinding; error?: string }>()
const emit = defineEmits<{
  'update:code': [code: string]
  'update:note': [note: string]
  remove: []
}>()

const capturing = ref(false)

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
  <li class="py-3">
    <div class="flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="w-40 rounded-md border px-3 py-2 text-left text-sm"
        :class="capturing ? 'border-key-active ring-2 ring-key-active/40' : 'border-stone-700 hover:bg-stone-800'"
        aria-label="Computer key. Click, then press a key."
        @click="capturing = true"
        @keydown="onKeydown"
        @blur="capturing = false"
      >
        <span v-if="capturing" class="text-key-active">Press a key…</span>
        <kbd v-else-if="binding.code" class="font-sans">{{ formatKeyCode(binding.code) }}</kbd>
        <span v-else class="text-stone-500">Not set</span>
      </button>

      <span class="text-sm text-stone-500">plays</span>

      <select
        class="rounded-md border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100"
        aria-label="Piano key"
        :value="binding.note"
        @change="emit('update:note', ($event.target as HTMLSelectElement).value)"
      >
        <optgroup v-for="g in NOTE_GROUPS" :key="g.octave" :label="`Octave ${g.octave}`">
          <option v-for="n in g.notes" :key="n" :value="n">{{ n }}</option>
        </optgroup>
      </select>

      <button
        type="button"
        class="ml-auto rounded-md px-3 py-2 text-sm text-stone-400 hover:bg-stone-800 hover:text-stone-100"
        @click="emit('remove')"
      >
        Remove
      </button>
    </div>

    <p v-if="error" class="mt-2 text-sm text-red-400" role="alert">{{ error }}</p>
  </li>
</template>