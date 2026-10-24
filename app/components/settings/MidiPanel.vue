<script setup lang="ts">
const { t, n } = useI18n()
const { status: pianoStatus, init } = usePiano()
const { status, devices, selectedId, lastNote, selectDevice, playTestNote } = useMidi()

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

const dotClass = computed(() => {
  switch (status.value) {
    case 'ready':
      return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]'
    case 'requesting':
      return 'bg-amber-400 animate-pulse'
    case 'idle':
      return 'bg-stone-500'
    default:
      return 'bg-red-400'
  }
})

const deviceName = (name: string) => name || t('settings.midi.unknownDevice')

const selectedMissing = computed(
  () => selectedId.value !== 'all' && !devices.value.some((d) => d.id === selectedId.value && d.connected),
)

/** وضعیت هر دستگاه: فعال (به صدا گوش می‌دیم)، آماده‌باش (وصله ولی دستگاه دیگه‌ای انتخاب شده)، قطع */
function deviceState(d: { id: string; connected: boolean }) {
  if (!d.connected) return 'off'
  return selectedId.value === 'all' || selectedId.value === d.id ? 'active' : 'standby'
}
const badgeClass = {
  active: 'bg-emerald-500/15 text-emerald-400',
  standby: 'bg-amber-400/15 text-amber-300',
  off: 'bg-stone-500/20 text-stone-400',
} as const
const badgeDot = {
  active: 'bg-emerald-500',
  standby: 'bg-amber-400',
  off: 'bg-stone-500',
} as const

const lastNoteLabel = computed(() => (lastNote.value ? `${lastNote.value.note} (${noteToMidi(lastNote.value.note)})` : '—'))

const card = 'rounded-2xl border border-stone-700/40 bg-stone-950/30'
</script>

<template>
  <div class="space-y-4">
    <!-- وضعیت اتصال + انتخاب دستگاه -->
    <section :class="[card, 'px-5 py-4']" aria-live="polite">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <span class="size-2.5 shrink-0 rounded-full" :class="dotClass" aria-hidden="true" />
          <template v-if="status === 'ready'">
            <span class="font-medium">{{ t('settings.midi.connected') }}</span>
            <span class="text-sm text-stone-400">
              {{ t('settings.midi.deviceCount', { n: n(devices.length) }, devices.length) }}
            </span>
          </template>
          <span v-else class="text-sm text-stone-300" role="status">{{ statusText }}</span>
        </div>

        <label v-if="status === 'ready'" class="relative block w-full sm:w-64">
          <span class="sr-only">{{ t('settings.midi.listenTo') }}</span>
          <select
            class="w-full appearance-none rounded-xl border border-stone-700/60 bg-stone-950/40 py-2.5 ps-3.5 pe-9 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-key-active/60 [&>option]:bg-stone-900"
            :value="selectedId"
            data-cuelume-select
            data-cuelume-emphasis="subtle"
            @change="selectDevice(($event.target as HTMLSelectElement).value)"
          >
            <option value="all">{{ t('settings.midi.allDevices') }}</option>
            <option v-if="selectedId !== 'all' && !devices.some((d) => d.id === selectedId)" :value="selectedId">
              {{ t('settings.midi.unknownDevice') }}
            </option>
            <option v-for="d in devices" :key="d.id" :value="d.id">{{ deviceName(d.name) }}</option>
          </select>
          <svg
            class="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
          </svg>
        </label>
      </div>

      <p v-if="selectedMissing && status === 'ready'" class="mt-3 text-sm text-stone-400">{{ t('settings.midi.missingDevice') }}</p>
    </section>

    <!-- کارت هر دستگاه -->
    <template v-if="status === 'ready'">
      <section
        v-for="d in devices"
        :key="d.id"
        :class="[card, 'flex items-center gap-4 px-5 py-4']"
      >
        <span class="grid size-12 shrink-0 place-items-center rounded-xl bg-stone-800/70 text-key-active" aria-hidden="true">
          <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="9" />
            <circle cx="8" cy="12" r="0.9" fill="currentColor" stroke="none" />
            <circle cx="9.6" cy="8.2" r="0.9" fill="currentColor" stroke="none" />
            <circle cx="12" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
            <circle cx="14.4" cy="8.2" r="0.9" fill="currentColor" stroke="none" />
            <circle cx="16" cy="12" r="0.9" fill="currentColor" stroke="none" />
            <path d="M8.5 16.5h7" stroke-linecap="round" />
          </svg>
        </span>

        <div class="min-w-0 flex-1">
          <p class="truncate font-medium">{{ deviceName(d.name) }}</p>
          <p class="mt-0.5 truncate text-xs text-stone-400">
            <template v-if="d.manufacturer">{{ d.manufacturer }} • </template>{{ t('settings.midi.inputOnly') }}
            <template v-if="lastNote && lastNote.source === d.id">
              • {{ t('settings.midi.velocity') }}: <span dir="ltr" class="inline-block">{{ lastNote.velocity }}</span>
            </template>
          </p>
        </div>

        <span
          class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          :class="badgeClass[deviceState(d)]"
        >
          <span class="size-1.5 rounded-full" :class="badgeDot[deviceState(d)]" aria-hidden="true" />
          {{ t(`settings.midi.state.${deviceState(d)}`) }}
        </span>
      </section>

      <p v-if="!devices.length" :class="[card, 'px-5 py-4 text-sm text-stone-400']">{{ t('settings.midi.status.readyNone') }}</p>
    </template>

    <!-- ورودی زنده -->
    <section :class="[card, 'px-5 py-4']" aria-labelledby="midi-live-title">
      <h3 id="midi-live-title" class="text-sm font-medium">{{ t('settings.midi.liveInput') }}</h3>
      <dl class="mt-3 grid grid-cols-3 gap-4 border-t border-stone-700/40 pt-4">
        <div>
          <dt class="text-xs text-stone-400">{{ t('settings.midi.lastNoteLabel') }}</dt>
          <dd class="mt-1 font-semibold" dir="ltr">{{ lastNoteLabel }}</dd>
        </div>
        <div>
          <dt class="text-xs text-stone-400">{{ t('settings.midi.velocity') }}</dt>
          <dd class="mt-1 font-semibold" dir="ltr">{{ lastNote ? lastNote.velocity : '—' }}</dd>
        </div>
        <div>
          <dt class="text-xs text-stone-400">{{ t('settings.midi.message') }}</dt>
          <dd class="mt-1 font-semibold" dir="ltr">{{ lastNote ? 'Note On (0x90)' : '—' }}</dd>
        </div>
      </dl>
    </section>

    <!-- تست دستگاه -->
    <section :class="[card, 'px-5 py-4']" aria-labelledby="midi-test-title">
      <h3 id="midi-test-title" class="text-sm font-medium">{{ t('settings.midi.testTitle') }}</h3>
      <div class="mt-3 flex flex-wrap items-center gap-4 border-t border-stone-700/40 pt-4">
        <button
          v-if="pianoStatus !== 'ready'"
          type="button"
          class="rounded-xl bg-stone-800/70 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-stone-800 disabled:opacity-60"
          :disabled="pianoStatus === 'loading'"
          @click="init"
        >
          {{ pianoStatus === 'loading' ? t('settings.midi.loadingSounds') : t('settings.midi.loadSounds') }}
        </button>
        <button
          v-else
          type="button"
          class="rounded-xl bg-stone-800/70 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-stone-800"
          @click="playTestNote()"
        >
          {{ t('settings.midi.testNote') }}
        </button>

        <p class="text-xs text-stone-400">
          {{ pianoStatus === 'ready' ? t('settings.midi.testHint') : t('settings.midi.testHintLoad') }}
        </p>
      </div>
    </section>
  </div>
</template>
