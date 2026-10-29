<script setup lang="ts">
const { t, n } = useI18n()
const { status: pianoStatus, init } = usePiano()
const { status, devices, selectedId, lastNote, selectDevice, playTestNote } = useMidi()

const deviceDropdownEl = ref<HTMLElement | null>(null)
const deviceTriggerEl = ref<HTMLButtonElement | null>(null)
const deviceMenuEl = ref<HTMLElement | null>(null)
const isDeviceMenuOpen = ref(false)

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
      return 'bg-key-active midi-status-glow ring-key-active/20'
    case 'requesting':
      return 'bg-amber-400 animate-ping'
    case 'idle':
      return 'bg-stone-500'
    default:
      return 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
  }
})

const deviceName = (name: string) => name || t('settings.midi.unknownDevice')

const selectedMissing = computed(
  () => selectedId.value !== 'all' && !devices.value.some((d) => d.id === selectedId.value && d.connected),
)

const deviceOptions = computed(() => [
  { id: 'all', label: t('settings.midi.allDevices') },
  ...(selectedMissing.value ? [{ id: selectedId.value, label: t('settings.midi.unknownDevice') }] : []),
  ...devices.value.map((device) => ({ id: device.id, label: deviceName(device.name) })),
])

const selectedDeviceLabel = computed(
  () => deviceOptions.value.find((option) => option.id === selectedId.value)?.label ?? t('settings.midi.unknownDevice'),
)

function focusDeviceOption(index: number) {
  const options = deviceMenuEl.value?.querySelectorAll<HTMLButtonElement>('[role="option"]')
  if (!options?.length) return
  options[Math.max(0, Math.min(index, options.length - 1))]?.focus()
}

function openDeviceMenu(focusSelected = true) {
  isDeviceMenuOpen.value = true
  nextTick(() => {
    const selectedIndex = deviceOptions.value.findIndex((option) => option.id === selectedId.value)
    focusDeviceOption(focusSelected && selectedIndex >= 0 ? selectedIndex : 0)
  })
}

function toggleDeviceMenu() {
  if (isDeviceMenuOpen.value) {
    isDeviceMenuOpen.value = false
    return
  }
  openDeviceMenu()
}

function chooseDevice(id: string) {
  selectDevice(id)
  isDeviceMenuOpen.value = false
  deviceTriggerEl.value?.focus()
}

function onDeviceTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    openDeviceMenu()
  } else if (event.key === 'Escape') {
    isDeviceMenuOpen.value = false
  }
}

function onDeviceMenuKeydown(event: KeyboardEvent) {
  const options = deviceMenuEl.value?.querySelectorAll<HTMLButtonElement>('[role="option"]')
  if (!options?.length) return
  const currentIndex = Array.from(options).indexOf(document.activeElement as HTMLButtonElement)

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const direction = event.key === 'ArrowDown' ? 1 : -1
    focusDeviceOption((currentIndex + direction + options.length) % options.length)
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    focusDeviceOption(event.key === 'Home' ? 0 : options.length - 1)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    isDeviceMenuOpen.value = false
    deviceTriggerEl.value?.focus()
  } else if (event.key === 'Tab') {
    isDeviceMenuOpen.value = false
  }
}

function onDocumentPointerDown(event: PointerEvent) {
  if (event.target instanceof Node && !deviceDropdownEl.value?.contains(event.target)) {
    isDeviceMenuOpen.value = false
  }
}

/** وضعیت هر دستگاه */
function deviceState(d: { id: string; connected: boolean }) {
  if (!d.connected) return 'off'
  return selectedId.value === 'all' || selectedId.value === d.id ? 'active' : 'standby'
}

const badgeClass = {
  active: 'bg-key-active/15 text-key-active border border-key-active/30',
  standby: 'bg-amber-400/15 text-amber-300 border border-amber-400/30',
  off: 'bg-stone-500/20 text-stone-400 border border-stone-600/30',
} as const

const badgeDot = {
  active: 'bg-key-active animate-pulse',
  standby: 'bg-amber-400',
  off: 'bg-stone-500',
} as const

const lastNoteLabel = computed(() => (lastNote.value ? `${lastNote.value.note} (${noteToMidi(lastNote.value.note)})` : '—'))

// درصد ولوستی برای رندر بصری میتر (۰ تا ۱۲۷)
const velocityPercentage = computed(() => {
  if (!lastNote.value || typeof lastNote.value.velocity !== 'number') return 0
  return Math.min(100, Math.round((lastNote.value.velocity / 127) * 100))
})

// تریگر بصری آنی موقع نواختن کلاویه (Trigger Glow)
const isNoteTriggered = ref(false)
let triggerTimeout: ReturnType<typeof setTimeout> | null = null

watch(lastNote, (val) => {
  if (val) {
    isNoteTriggered.value = true
    if (triggerTimeout) clearTimeout(triggerTimeout)
    triggerTimeout = setTimeout(() => {
      isNoteTriggered.value = false
    }, 280)
  }
})

// انیمیشن دکمه تست
const isTesting = ref(false)
function triggerTestNote() {
  isTesting.value = true
  playTestNote()
  setTimeout(() => {
    isTesting.value = false
  }, 400)
}

const card = 'rounded-2xl border border-stone-800/80 bg-stone-950/40 backdrop-blur-sm transition-all duration-300'

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))
</script>

<template>
  <div class="space-y-4">
    <!-- وضعیت اتصال + انتخاب دستگاه -->
    <section :class="[card, 'px-5 py-4 hover:border-stone-700/60', isDeviceMenuOpen && 'relative z-40']" aria-live="polite">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <div class="relative flex items-center justify-center">
            <span class="size-2.5 shrink-0 rounded-full transition-all duration-300 ring-4" :class="dotClass" aria-hidden="true" />
            <span v-if="status === 'ready'" class="absolute -inset-1 rounded-full bg-key-active/20 animate-ping opacity-60"></span>
          </div>

          <template v-if="status === 'ready'">
            <span class="font-medium text-stone-100">{{ t('settings.midi.connected') }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-stone-800/80 text-stone-300 border border-stone-700/50">
              {{ t('settings.midi.deviceCount', { n: n(devices.length) }, devices.length) }}
            </span>
          </template>
          <span v-else class="text-sm text-stone-300 font-medium" role="status">{{ statusText }}</span>
        </div>

        <div v-if="status === 'ready'" ref="deviceDropdownEl" class="relative w-full sm:w-64">
          <span id="midi-device-label" class="sr-only">{{ t('settings.midi.listenTo') }}</span>
          <button
            ref="deviceTriggerEl"
            type="button"
            class="group flex w-full items-center justify-between gap-3 rounded-xl border border-stone-700/60 bg-stone-900/60 py-2.5 ps-3.5 pe-3 text-start text-sm text-stone-200 transition-all duration-200 hover:border-stone-600 focus:outline-none focus:border-key-active focus:ring-2 focus:ring-key-active/30"
            aria-haspopup="listbox"
            aria-controls="midi-device-listbox"
            :aria-expanded="isDeviceMenuOpen"
            aria-labelledby="midi-device-label"
            data-cuelume-select
            data-cuelume-emphasis="subtle"
            @click="toggleDeviceMenu"
            @keydown="onDeviceTriggerKeydown"
          >
            <span class="truncate">{{ selectedDeviceLabel }}</span>
            <svg
              class="size-4 shrink-0 text-stone-400 transition-transform duration-200 group-hover:text-stone-200"
              :class="{ 'rotate-180': isDeviceMenuOpen }"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
            </svg>
          </button>

          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="translate-y-1 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-1 opacity-0"
          >
            <div
              v-if="isDeviceMenuOpen"
              id="midi-device-listbox"
              ref="deviceMenuEl"
              class="absolute inset-x-0 top-full z-30 mt-2 max-h-60 overflow-y-auto rounded-xl border border-stone-700/70 bg-stone-900 p-1.5 shadow-xl shadow-black/30"
              role="listbox"
              :aria-labelledby="'midi-device-label'"
              @keydown="onDeviceMenuKeydown"
            >
              <button
                v-for="option in deviceOptions"
                :key="option.id"
                type="button"
                role="option"
                :aria-selected="selectedId === option.id"
                class="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-start text-sm text-stone-200 transition-colors hover:bg-stone-800 focus:bg-stone-800 focus:outline-none"
                :class="{ 'bg-stone-800 text-key-active': selectedId === option.id }"
                @click="chooseDevice(option.id)"
              >
                <span class="truncate">{{ option.label }}</span>
                <svg
                  v-if="selectedId === option.id"
                  class="size-4 shrink-0 text-key-active"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.26a1 1 0 0 1-1.42.003L3.29 9.168a1 1 0 1 1 1.42-1.407l4.09 4.13 6.49-6.596a1 1 0 0 1 1.414-.006Z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <p v-if="selectedMissing && status === 'ready'" class="mt-3 text-sm text-amber-300/90 flex items-center gap-1.5 animate-fadeIn">
        <span>⚠️</span>
        <span>{{ t('settings.midi.missingDevice') }}</span>
      </p>
    </section>

    <!-- کارت‌های دستگاه‌ها با TransitionGroup برای ورود و خروج دیوایس‌ها -->
    <template v-if="status === 'ready'">
      <TransitionGroup name="midi-device-list" tag="div" class="space-y-3">
        <section
          v-for="d in devices"
          :key="d.id"
          :class="[
            card,
            'relative overflow-hidden flex items-center gap-4 px-5 py-4 transition-all duration-200',
            lastNote && lastNote.source === d.id && isNoteTriggered
              ? 'border-key-active/70 bg-key-active/[0.04] midi-device-glow scale-[1.005]'
              : 'hover:border-stone-700/70 hover:bg-stone-900/30'
          ]"
        >
          <!-- افکت نوری فلش در زمان دریافت سیگنال از همین دستگاه -->
          <div
            v-if="lastNote && lastNote.source === d.id && isNoteTriggered"
            class="pointer-events-none absolute inset-0 bg-gradient-to-r from-key-active/15 via-transparent to-transparent animate-pulse-fast"
          />

          <!-- آیکون DIN پورت میدی -->
          <span 
            class="relative grid size-12 shrink-0 place-items-center rounded-xl bg-stone-900 border border-stone-800 transition-all duration-300 text-stone-400"
            :class="{ '!text-key-active !border-key-active/40 !bg-key-active/10 midi-icon-glow': lastNote && lastNote.source === d.id && isNoteTriggered }"
            aria-hidden="true"
          >
            <svg class="size-6 transition-transform duration-200" :class="{ 'scale-110': lastNote && lastNote.source === d.id && isNoteTriggered }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
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
            <p class="truncate font-medium text-stone-100 flex items-center gap-2">
              <span>{{ deviceName(d.name) }}</span>
              <span v-if="lastNote && lastNote.source === d.id && isNoteTriggered" class="inline-block text-xs font-mono text-key-active animate-bounce">♪</span>
            </p>
            <p class="mt-0.5 truncate text-xs text-stone-400">
              <template v-if="d.manufacturer">{{ d.manufacturer }} • </template>{{ t('settings.midi.inputOnly') }}
              <template v-if="lastNote && lastNote.source === d.id">
                • {{ t('settings.midi.velocity') }}: <span dir="ltr" class="inline-block font-mono text-stone-300 font-semibold">{{ lastNote.velocity }}</span>
              </template>
            </p>
          </div>

          <span
            class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-300"
            :class="badgeClass[deviceState(d)]"
          >
            <span class="size-1.5 rounded-full" :class="badgeDot[deviceState(d)]" aria-hidden="true" />
            {{ t(`settings.midi.state.${deviceState(d)}`) }}
          </span>
        </section>
      </TransitionGroup>

      <p v-if="!devices.length" :class="[card, 'px-5 py-6 text-center text-sm text-stone-400']">
        {{ t('settings.midi.status.readyNone') }}
      </p>
    </template>

    <!-- مانیتور ورودی زنده (Live MIDI Activity & Velocity VU Meter) -->
    <section 
      :class="[
        card, 
        'px-5 py-4 transition-all duration-200',
        isNoteTriggered ? 'border-key-active/50 midi-live-glow' : 'hover:border-stone-700/60'
      ]" 
      aria-labelledby="midi-live-title"
    >
      <div class="flex items-center justify-between">
        <h3 id="midi-live-title" class="text-sm font-medium flex items-center gap-2 text-stone-200">
          <span>{{ t('settings.midi.liveInput') }}</span>
          <span 
            class="inline-block size-2 rounded-full transition-colors duration-150"
            :class="isNoteTriggered ? 'bg-key-active shadow-[0_0_8px_var(--color-key-active)] scale-125' : 'bg-stone-700'"
          />
        </h3>

        <!-- کلاویه مجازی کوچک که وضعیت فشرده شدن رو شبیه‌سازی می‌کنه -->
        <span 
          class="text-xs font-mono px-2 py-0.5 rounded transition-all duration-150"
          :class="isNoteTriggered ? 'bg-key-active text-stone-950 font-bold scale-105' : 'bg-stone-900 text-stone-500'"
        >
          {{ isNoteTriggered ? 'NOTE ON' : 'STANDBY' }}
        </span>
      </div>

      <!-- مقادیر نت و شدت ضربه -->
      <dl class="mt-3.5 grid grid-cols-3 gap-4 border-t border-stone-800/80 pt-4">
        <div>
          <dt class="text-xs text-stone-400">{{ t('settings.midi.lastNoteLabel') }}</dt>
          <dd 
            class="mt-1 font-semibold text-base transition-transform duration-150" 
            :class="[isNoteTriggered ? 'text-key-active scale-105 origin-left' : 'text-stone-200']"
            dir="ltr"
          >
            {{ lastNoteLabel }}
          </dd>
        </div>

        <div>
          <dt class="text-xs text-stone-400">{{ t('settings.midi.velocity') }}</dt>
          <dd 
            class="mt-1 font-semibold text-base transition-transform duration-150" 
            :class="[isNoteTriggered ? 'text-key-active scale-105 origin-left' : 'text-stone-200']"
            dir="ltr"
          >
            {{ lastNote ? lastNote.velocity : '—' }}
          </dd>
        </div>

        <div>
          <dt class="text-xs text-stone-400">{{ t('settings.midi.message') }}</dt>
          <dd class="mt-1 font-semibold font-mono text-xs sm:text-sm text-stone-300" dir="ltr">
            {{ lastNote ? 'Note On (0x90)' : '—' }}
          </dd>
        </div>
      </dl>

      <!-- نوار مدرج لایو Velocity Meter مشابه نرم‌افزارهای موسیقی -->
      <div class="mt-4 pt-3 border-t border-stone-800/40">
        <div class="flex items-center justify-between text-[11px] text-stone-500 mb-1">
          <span>Velocity Level</span>
          <span class="font-mono">{{ velocityPercentage }}%</span>
        </div>
        <div class="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden p-[1px]">
          <div 
            class="h-full rounded-full transition-all duration-100 ease-out bg-gradient-to-r from-key-active via-stone-500 to-key-active"
            :style="{ width: `${velocityPercentage}%` }"
          />
        </div>
      </div>
    </section>

    <!-- تست صدای پیانو -->
    <section :class="[card, 'px-5 py-4 hover:border-stone-700/60']" aria-labelledby="midi-test-title">
      <h3 id="midi-test-title" class="text-sm font-medium text-stone-200">{{ t('settings.midi.testTitle') }}</h3>
      <div class="mt-3 flex flex-wrap items-center gap-4 border-t border-stone-800/80 pt-4">
        <!-- دکمه دانلود ساندفونت -->
        <button
          v-if="pianoStatus !== 'ready'"
          type="button"
          class="relative overflow-hidden rounded-xl bg-stone-800/90 px-4 py-2.5 text-sm font-medium text-stone-200 transition-all duration-200 hover:bg-stone-700 hover:text-white active:scale-95 disabled:opacity-60"
          :disabled="pianoStatus === 'loading'"
          @click="init"
        >
          <span v-if="pianoStatus === 'loading'" class="flex items-center gap-2">
            <span class="size-3.5 animate-spin rounded-full border-2 border-stone-300 border-t-transparent"></span>
            <span>{{ t('settings.midi.loadingSounds') }}</span>
          </span>
          <span v-else class="flex items-center gap-2">
            <span>📥</span>
            <span>{{ t('settings.midi.loadSounds') }}</span>
          </span>
        </button>

        <!-- دکمه تست کلاویه با انیمیشن لمسی پیانو و امواج صدا -->
        <button
          v-else
          type="button"
          class="piano-test-btn group relative overflow-hidden rounded-xl bg-gradient-to-b from-stone-800 to-stone-900 border border-stone-700/70 px-5 py-2.5 text-sm font-medium text-stone-100 transition-all duration-150 hover:border-key-active/60 hover:text-key-active active:translate-y-0.5 active:bg-stone-950 active:shadow-inner"
          :class="{ 'ring-2 ring-key-active/40 border-key-active': isTesting }"
          @click="triggerTestNote"
        >
          <span class="relative z-10 flex items-center gap-2">
            <svg
              class="size-5 text-key-active transition-transform group-hover:scale-110"
              :class="{ 'animate-bounce': isTesting }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M4 7.5h16a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 19V9A1.5 1.5 0 0 1 4 7.5Z" />
              <path d="M2.5 11h19M6 11v9.5M9.5 11v9.5M13 11v9.5M16.5 11v9.5" />
              <path d="M5 8v3M8.25 8v3M12 8v3M15.75 8v3M19 8v3" stroke-width="2.5" />
            </svg>
            <span>{{ t('settings.midi.testNote') }}</span>
          </span>

          <!-- موج صوتی هنگام فشرده شدن دکمه تست -->
          <span v-if="isTesting" class="test-wave"></span>
        </button>

        <p class="text-xs text-stone-400">
          {{ pianoStatus === 'ready' ? t('settings.midi.testHint') : t('settings.midi.testHintLoad') }}
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 1. لیست متحرک دیوایس‌ها هنگام اضافه شدن یا قطع شدن */
.midi-device-list-enter-active,
.midi-device-list-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.midi-device-list-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.97);
}

.midi-device-list-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

/* 2. انیمیشن فلش سریع هنگام ارسال سیگنال MIDI */
@keyframes pulseFast {
  0% { opacity: 0.9; }
  100% { opacity: 0; }
}

.animate-pulse-fast {
  animation: pulseFast 0.28s ease-out forwards;
}

.midi-status-glow {
  box-shadow: 0 0 12px color-mix(in srgb, var(--color-key-active) 80%, transparent);
}

.midi-device-glow {
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-key-active) 10%, transparent);
}

.midi-icon-glow {
  box-shadow: 0 0 12px color-mix(in srgb, var(--color-key-active) 20%, transparent);
}

.midi-live-glow {
  box-shadow: 0 0 25px color-mix(in srgb, var(--color-key-active) 7%, transparent);
}

/* 3. انیمیشن موج صوتی دکمه تست پیانو */
.piano-test-btn {
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.4);
}

.piano-test-btn:active {
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
}

.test-wave {
  position: absolute;
  inset: 0;
  border-radius: 0.75rem;
  background: var(--color-key-active, #10b981);
  opacity: 0.3;
  animation: waveOut 0.45s ease-out forwards;
  pointer-events: none;
}

@keyframes waveOut {
  0% {
    transform: scale(0.85);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* 4. فید این نرم خطاها */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.25s ease-out;
}
</style>