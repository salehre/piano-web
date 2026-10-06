<script setup lang="ts">
const { status: pianoStatus, init } = usePiano()
const { status, devices, selectedId, lastNote, connect, selectDevice, playTestNote } = useMidi()

const statusText = computed(() => {
  switch (status.value) {
    case 'requesting':
      return 'Waiting for your permission…'
    case 'ready':
      return devices.value.length
        ? 'Connected. Play a key on your MIDI device.'
        : 'Connected, but no MIDI device was found. Plug one in or start a virtual MIDI port.'
    case 'denied':
      return 'MIDI access is blocked. Allow it for this site in your browser settings, then reload the page.'
    case 'unsupported':
      return "This browser doesn't support Web MIDI. Try Chrome or Edge."
    case 'insecure':
      return 'Web MIDI only works on HTTPS or localhost.'
    case 'error':
      return 'Could not start MIDI. Try again.'
    default:
      return 'Not connected yet.'
  }
})

const sourceName = (id: string) =>
  id === SIMULATED_SOURCE ? 'test button' : (devices.value.find((d) => d.id === id)?.name ?? 'a MIDI device')

const selectedMissing = computed(
  () => selectedId.value !== 'all' && !devices.value.some((d) => d.id === selectedId.value && d.connected),
)
</script>

<template>
  <section aria-labelledby="midi-title">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="max-w-md">
        <h2 id="midi-title" class="text-lg font-medium">MIDI keyboard</h2>
        <p class="mt-1 text-sm text-stone-400">
          Play the piano with a MIDI keyboard, a simulator, or a device you build yourself. Key presses are played
          with their real velocity.
        </p>
      </div>

      <button
        v-if="status === 'idle' || status === 'error' || status === 'denied'"
        type="button"
        class="rounded-md bg-key-active px-4 py-2 text-sm font-medium text-stone-950"
        @click="connect"
      >
        {{ status === 'error' || status === 'denied' ? 'Try again' : 'Connect MIDI' }}
      </button>
    </div>

    <p class="mt-4 text-sm" :class="status === 'ready' ? 'text-stone-300' : 'text-stone-400'" role="status">
      {{ statusText }}
    </p>

    <fieldset v-if="status === 'ready'" class="mt-4">
      <legend class="mb-2 text-sm text-stone-400">Listen to</legend>
      <div class="space-y-2">
        <label
          class="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm"
          :class="selectedId === 'all' ? 'border-key-active bg-stone-800' : 'border-stone-700 hover:bg-stone-800'"
        >
          <input
            type="radio"
            name="midi-device"
            class="accent-[#F5E6C8]"
            :checked="selectedId === 'all'"
            @change="selectDevice('all')"
          />
          All devices
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
            class="accent-[#F5E6C8]"
            :checked="selectedId === d.id"
            @change="selectDevice(d.id)"
          />
          <span class="flex-1">
            {{ d.name }}
            <span v-if="d.manufacturer" class="text-stone-500">{{ d.manufacturer }}</span>
          </span>
          <span class="flex items-center gap-2 text-xs text-stone-400">
            <span class="size-2 rounded-full" :class="d.connected ? 'bg-emerald-500' : 'bg-stone-600'" />
            {{ d.connected ? 'Connected' : 'Disconnected' }}
          </span>
        </label>
      </div>

      <p v-if="selectedMissing" class="mt-2 text-sm text-stone-400">
        The device you picked isn't connected right now, so nothing will play until it comes back or you choose
        "All devices".
      </p>
    </fieldset>

    <div class="mt-6 flex flex-wrap items-center gap-3 border-t border-stone-800 pt-4">
      <button
        v-if="pianoStatus !== 'ready'"
        type="button"
        class="rounded-md border border-stone-700 px-3 py-2 text-sm hover:bg-stone-800 disabled:opacity-60"
        :disabled="pianoStatus === 'loading'"
        @click="init"
      >
        {{ pianoStatus === 'loading' ? 'Loading sounds…' : 'Load piano sounds' }}
      </button>
      <button
        v-else
        type="button"
        class="rounded-md border border-stone-700 px-3 py-2 text-sm hover:bg-stone-800"
        @click="playTestNote()"
      >
        Play test note
      </button>

      <p class="text-sm text-stone-400" aria-live="polite">
        <template v-if="lastNote">
          Last note: <span class="text-stone-200">{{ lastNote.note }}</span>, velocity
          <span class="text-stone-200">{{ lastNote.velocity }}</span> from {{ sourceName(lastNote.source) }}
        </template>
        <template v-else>No notes received yet.</template>
      </p>
    </div>
  </section>
</template>