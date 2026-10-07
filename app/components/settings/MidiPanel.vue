<script setup lang="ts">
const { t } = useI18n()
const { status: pianoStatus, init } = usePiano()
const { status, devices, selectedId, lastNote, connect, selectDevice, playTestNote } = useMidi()

const statusText = computed(() => {
  switch (status.value) {
    case 'ready':
      return t(devices.value.length ? 'settings.midi.status.readyDevices' : 'settings.midi.status.readyNone')
    case 'requesting':
    case 'denied':
    case 'unsupported':
    case 'insecure':
    case 'error':
      return t(`settings.midi.status.${status.value}`)
    default:
      return t('settings.midi.status.idle')
  }
})

const deviceName = (name: string) => name || t('settings.midi.unknownDevice')
const sourceName = (id: string) => {
  if (id === SIMULATED_SOURCE) return t('settings.midi.sourceTest')
  const device = devices.value.find((d) => d.id === id)
  return device ? deviceName(device.name) : t('settings.midi.sourceAny')
}

const selectedMissing = computed(
  () => selectedId.value !== 'all' && !devices.value.some((d) => d.id === selectedId.value && d.connected),
)
</script>

<template>
  <section aria-labelledby="midi-title">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="max-w-md">
        <h2 id="midi-title" class="text-lg font-medium">{{ t('settings.midi.title') }}</h2>
        <p class="mt-1 text-sm text-stone-400">
          {{ t('settings.midi.description') }}
        </p>
      </div>

      <button
        v-if="status === 'idle' || status === 'error' || status === 'denied'"
        type="button"
        class="rounded-md bg-key-active px-4 py-2 text-sm font-medium text-stone-950"
        @click="connect"
      >
        {{ status === 'error' || status === 'denied' ? t('settings.midi.tryAgain') : t('settings.midi.connect') }}
      </button>
    </div>

    <p class="mt-4 text-sm" :class="status === 'ready' ? 'text-stone-300' : 'text-stone-400'" role="status">
      {{ statusText }}
    </p>

    <fieldset v-if="status === 'ready'" class="mt-4">
      <legend class="mb-2 text-sm text-stone-400">{{ t('settings.midi.listenTo') }}</legend>
      <div class="space-y-2">
        <label
          class="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm"
          :class="selectedId === 'all' ? 'border-key-active bg-stone-800' : 'border-stone-700 hover:bg-stone-800'"
        >
          <input
            type="radio"
            name="midi-device"
            class="accent-key-active"
            :checked="selectedId === 'all'"
            @change="selectDevice('all')"
          />
          {{ t('settings.midi.allDevices') }}
        </label>

        <label
          v-for="d in devices"
          :key="d.id"
          class="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm"
          :class="selectedId === d.id ? 'border-key-active bg-stone-800' : 'border-stone-700 hover:bg-stone-800'"
        >
          <input
            type="radio"
            name="midi-device"
            class="accent-key-active"
            :checked="selectedId === d.id"
            @change="selectDevice(d.id)"
          />
          <span class="flex-1">
            {{ deviceName(d.name) }}
            <span v-if="d.manufacturer" class="text-stone-500">{{ d.manufacturer }}</span>
          </span>
          <span class="flex items-center gap-2 text-xs text-stone-400">
            <span class="size-2 rounded-full" :class="d.connected ? 'bg-emerald-500' : 'bg-stone-600'" />
            {{ d.connected ? t('settings.midi.connected') : t('settings.midi.disconnected') }}
          </span>
        </label>
      </div>

      <p v-if="selectedMissing" class="mt-2 text-sm text-stone-400">{{ t('settings.midi.missingDevice') }}</p>
    </fieldset>

    <div class="mt-6 flex flex-wrap items-center gap-3 border-t border-stone-800 pt-4">
      <button
        v-if="pianoStatus !== 'ready'"
        type="button"
        class="rounded-md border border-stone-700 px-3 py-2 text-sm hover:bg-stone-800 disabled:opacity-60"
        :disabled="pianoStatus === 'loading'"
        @click="init"
      >
        {{ pianoStatus === 'loading' ? t('settings.midi.loadingSounds') : t('settings.midi.loadSounds') }}
      </button>
      <button
        v-else
        type="button"
        class="rounded-md border border-stone-700 px-3 py-2 text-sm hover:bg-stone-800"
        @click="playTestNote()"
      >
        {{ t('settings.midi.testNote') }}
      </button>

      <p class="text-sm text-stone-400" aria-live="polite">
        <i18n-t v-if="lastNote" keypath="settings.midi.lastNote" scope="global">
          <template #note><span class="text-stone-200">{{ lastNote.note }}</span></template>
          <template #velocity><span class="text-stone-200">{{ lastNote.velocity }}</span></template>
          <template #source>{{ sourceName(lastNote.source) }}</template>
        </i18n-t>
        <template v-else>{{ t('settings.midi.noNotes') }}</template>
      </p>
    </div>
  </section>
</template>