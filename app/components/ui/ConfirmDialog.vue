<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
  }>(),
  { confirmLabel: 'Confirm', cancelLabel: 'Cancel' },
)

const emit = defineEmits<{ confirm: [] }>()
const open = defineModel<boolean>({ default: false })

const dialog = ref<HTMLDialogElement | null>(null)
const titleId = useId()
const messageId = useId()

// <dialog> بومی: فوکوس‌تله، بستن با Esc و لایه‌ی پس‌زمینه رو خودش مدیریت می‌کنه
watch(open, (isOpen) => {
  const el = dialog.value
  if (!el) return
  if (isOpen && !el.open) el.showModal()
  else if (!isOpen && el.open) el.close()
})

function cancel() {
  open.value = false
}

function confirm() {
  open.value = false
  emit('confirm')
}

// کلیک روی خود لایه‌ی تیره (نه محتوای دیالوگ) = انصراف
function onBackdropClick(e: MouseEvent) {
  if (e.target === dialog.value) cancel()
}
</script>

<template>
  <dialog
      ref="dialog"
      class="glass-card m-auto w-[calc(100%-3rem)] max-w-sm border-0 bg-transparent p-0 backdrop:bg-black/60"
      :aria-labelledby="titleId"
      :aria-describedby="message ? messageId : undefined"
      @close="open = false"
      @click="onBackdropClick"
  >
    <div class="p-6">
      <h2 :id="titleId" class="text-lg font-semibold">{{ title }}</h2>
      <p v-if="message" :id="messageId" class="mt-2 text-sm text-stone-400">{{ message }}</p>

      <div class="mt-6 flex flex-wrap justify-end gap-3">
        <button
            type="button"
            class="rounded-lg border border-stone-700 px-4 py-2 text-sm hover:bg-stone-800"
            autofocus
            @click="cancel"
        >
          {{ cancelLabel }}
        </button>
        <button
            type="button"
            class="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            @click="confirm"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </dialog>
</template>