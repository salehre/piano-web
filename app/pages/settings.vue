<script setup lang="ts">
const { t, n } = useI18n()
const { bindings, setBinding, clearBinding, resetBindings } = useKeyBindings()

useHead({ title: () => t('settings.title') })

// خطای هر نت (مثلاً کلید تکراری)؛ ارجاع به پیام نگه داشته می‌شه تا با عوض شدن زبان ترجمه‌اش عوض بشه
const errors = ref<Record<string, MessageRef>>({})
const tr = useTr()

function setCode(note: string, code: string) {
  const clash = Object.entries(bindings.value).find(([n, c]) => c === code && n !== note)
  if (clash) {
    errors.value[note] = msgRef('settings.shortcuts.clash', { key: formatKeyCode(code), note: clash[0] })
    return
  }
  delete errors.value[note]
  setBinding(note, code)
}

function clear(note: string) {
  delete errors.value[note]
  clearBinding(note)
}

const showResetConfirm = ref(false)

function reset() {
  errors.value = {}
  resetBindings()
}

/** تعداد نت‌های تنظیم‌شده‌ی هر اکتاو */
function assignedCount(notes: string[]) {
  return notes.filter((n) => bindings.value[n]).length
}
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-8">
    <h1 class="text-2xl font-semibold">{{ t('settings.title') }}</h1>

    <SettingsMidiPanel class="mt-8" />

    <section class="mt-8" aria-labelledby="shortcuts-title">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="max-w-md">
          <h2 id="shortcuts-title" class="text-lg font-medium">{{ t('settings.shortcuts.title') }}</h2>
          <p class="mt-1 text-sm text-stone-400">
            All 88 piano keys are listed by octave. Click a field, then press the computer key you want for that
            note. Shortcuts for notes outside the selected piano size are ignored. Keys are matched by position, so
            they work with any keyboard language.
          </p>
        </div>

        <button
          type="button"
          class="rounded-md border border-stone-700 px-3 py-2 text-sm hover:bg-stone-800"
          @click="showResetConfirm = true"
        >
          {{ t('settings.shortcuts.reset') }}
        </button>
      </div>

      <div class="mt-6 space-y-8">
        <section v-for="g in NOTE_GROUPS" :key="g.octave" :aria-labelledby="`octave-${g.octave}`">
          <div class="flex items-baseline justify-between border-b border-stone-800 pb-2">
            <h3 :id="`octave-${g.octave}`" class="text-base font-medium">{{ t('settings.shortcuts.octave', { n: n(g.octave) }) }}</h3>
            <span class="text-xs text-stone-500">{{ t('settings.shortcuts.assigned', { set: n(assignedCount(g.notes)), total: n(g.notes.length) }) }}</span>
          </div>

          <ul class="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-x-6">
            <SettingsKeyBindingRow
              v-for="note in g.notes"
              :key="note"
              :note="note"
              :code="bindings[note] ?? null"
              :error="tr(errors[note])"
              @update:code="setCode(note, $event)"
              @clear="clear(note)"
            />
          </ul>
        </section>
      </div>
    </section>

    <UiConfirmDialog
      v-model="showResetConfirm"
      :title="t('settings.shortcuts.resetTitle')"
      :message="t('settings.shortcuts.resetMessage')"
      :confirm-label="t('settings.shortcuts.resetConfirm')"
      :cancel-label="t('settings.shortcuts.resetCancel')"
      @confirm="reset"
    />
  </main>
</template>