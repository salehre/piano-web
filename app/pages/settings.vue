<script setup lang="ts">
const { bindings, addBinding, updateBinding, removeBinding, resetBindings } = useKeyBindings()

useHead({ title: 'Settings | Web Piano' })

// خطای هر ردیف (مثلاً کلید تکراری)
const errors = ref<Record<string, string>>({})

function setCode(id: string, code: string) {
  const clash = bindings.value.find((b) => b.code === code && b.id !== id)
  if (clash) {
    errors.value[id] = `${formatKeyCode(code)} already plays ${clash.note}. Remove or change that shortcut first.`
    return
  }
  delete errors.value[id]
  updateBinding(id, { code })
}

function setNote(id: string, note: string) {
  updateBinding(id, { note })
}

function remove(id: string) {
  delete errors.value[id]
  removeBinding(id)
}

function reset() {
  if (!window.confirm('Reset all shortcuts to the defaults?')) return
  errors.value = {}
  resetBindings()
}
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-8">
    <h1 class="text-2xl font-semibold">Settings</h1>

    <section class="mt-8" aria-labelledby="shortcuts-title">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="max-w-md">
          <h2 id="shortcuts-title" class="text-lg font-medium">Keyboard shortcuts</h2>
          <p class="mt-1 text-sm text-stone-400">
            Choose which key on your computer plays each piano key. Shortcuts for notes outside the
            selected piano size are ignored. Keys are matched by position, so they work with any keyboard language.
          </p>
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-md border border-stone-700 px-3 py-2 text-sm hover:bg-stone-800"
            @click="reset"
          >
            Reset to defaults
          </button>
          <button
            type="button"
            class="rounded-md bg-key-active px-3 py-2 text-sm font-medium text-stone-950"
            @click="addBinding"
          >
            Add shortcut
          </button>
        </div>
      </div>

      <ul v-if="bindings.length" class="mt-6 divide-y divide-stone-800 border-y border-stone-800">
        <SettingsKeyBindingRow
          v-for="b in bindings"
          :key="b.id"
          :binding="b"
          :error="errors[b.id]"
          @update:code="setCode(b.id, $event)"
          @update:note="setNote(b.id, $event)"
          @remove="remove(b.id)"
        />
      </ul>
      <p v-else class="mt-6 text-sm text-stone-400">
        No shortcuts yet. Add one to play a piano key from your keyboard.
      </p>
    </section>
  </main>
</template>