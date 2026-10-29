<script setup lang="ts">
const { t } = useI18n()
const props = defineProps<{ note: string; code: string | null; error?: string }>()
const emit = defineEmits<{
  'update:code': [code: string]
  clear: []
}>()

const capturing = ref(false)
const justCaptured = ref(false)
const isBlack = computed(() => props.note.includes('#'))

function onKeydown(e: KeyboardEvent) {
  if (!capturing.value) return
  if (MODIFIER_CODES.has(e.code)) return
  e.preventDefault()
  e.stopPropagation()

  if (e.code !== 'Escape') {
    emit('update:code', e.code)
    justCaptured.value = true
    setTimeout(() => (justCaptured.value = false), 500)
  }

  capturing.value = false
  ;(e.currentTarget as HTMLElement)?.blur()
}
</script>

<template>
  <div class="group py-2.5">
    <div class="flex items-center gap-3">

      <!-- ───── Note Badge ───── -->
      <span
        class="note-badge relative flex h-10 w-12 shrink-0 items-center justify-center
               rounded-xl text-sm font-bold tracking-wide shadow-md
               transition-all duration-300 ease-out
               group-hover:scale-105 group-hover:shadow-lg"
        :class="isBlack
          ? 'bg-linear-to-br from-stone-700 to-stone-900 text-stone-100 ring-1 ring-white/10'
          : 'bg-linear-to-br from-stone-50 to-stone-200 text-stone-900 ring-1 ring-stone-300/60'"
      >
        <!-- shine overlay -->
        <span
          class="pointer-events-none absolute inset-0 rounded-xl opacity-0
                 transition-opacity duration-300 group-hover:opacity-100"
          :class="isBlack
            ? 'bg-linear-to-tr from-transparent via-white/10 to-transparent'
            : 'bg-linear-to-tr from-transparent via-white/60 to-transparent'"
        />
        <span class="relative z-10">{{ note }}</span>
      </span>

      <!-- ───── Key Capture Button ───── -->
      <div class="relative shrink-0">
        <!-- animated glow ring when capturing -->
        <span
          class="pointer-events-none absolute -inset-1 rounded-xl opacity-0
                 transition-opacity duration-300"
          :class="capturing ? 'animate-glow-ring opacity-100' : ''"
        />

        <button
          type="button"
          class="key-btn relative flex h-10 w-24 items-center justify-center
                 rounded-xl border text-sm font-medium
                 transition-all duration-200 ease-out
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-key-active/60 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
          :class="[
            capturing
              ? 'key-btn-capturing border-key-active/60 bg-key-active/10 text-key-active'
              : 'border-stone-700/60 bg-stone-800/50 text-stone-300 hover:border-stone-500 hover:bg-stone-700/60 hover:text-stone-100 hover:shadow-md',
            justCaptured ? 'animate-key-pop' : '',
          ]"
          :aria-label="t('settings.row.keyAria', { note })"
          data-cuelume-tap
          data-cuelume-emphasis="subtle"
          @click="capturing = true"
          @keydown="onKeydown"
          @blur="capturing = false"
        >
          <Transition name="key-swap" mode="out-in">
            <span v-if="capturing" key="capture" class="flex items-center gap-1.5">
              <span class="inline-block h-2 w-2 animate-ping rounded-full bg-key-active" />
              <span class="text-key-active">{{ t('settings.row.pressKey') }}</span>
            </span>

            <kbd
              v-else-if="code"
              key="code"
              class="font-sans tracking-wide text-stone-200"
            >
              {{ formatKeyCode(code) }}
            </kbd>

            <span v-else key="empty" class="text-stone-600">—</span>
          </Transition>
        </button>
      </div>

      <!-- ───── Clear Button ───── -->
      <button
        type="button"
        class="clear-btn flex h-10 w-10 shrink-0 items-center justify-center
               rounded-xl text-stone-500
               transition-all duration-200 ease-out
               hover:bg-red-500/10 hover:text-red-400 hover:shadow-md
               active:scale-90
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
        :class="{ 'pointer-events-none opacity-0': !code }"
        :tabindex="code ? 0 : -1"
        :aria-label="t('settings.row.clearAria', { note })"
        data-cuelume-tap
        data-cuelume-emphasis="subtle"
        @click="emit('clear')"
      >
        <!-- ✕ icon -->
        <svg
          class="h-4 w-4 transition-transform duration-200 group-hover:rotate-90"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- ───── Error Message ───── -->
    <Transition name="error-slide">
      <p
        v-if="error"
        class="mt-2 flex items-center gap-1.5 pl-15 text-sm text-red-400"
        role="alert"
      >
        <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        {{ error }}
      </p>
    </Transition>
  </div>
</template>

<style scoped>
/* ── Glow ring around the capture button ── */
@keyframes glow-ring {
  0%, 100% {
    box-shadow: 0 0 8px 2px color-mix(in srgb, var(--color-key-active) 30%, transparent);
  }
  50% {
    box-shadow: 0 0 20px 6px color-mix(in srgb, var(--color-key-active) 50%, transparent);
  }
}
.animate-glow-ring {
  animation: glow-ring 1.6s ease-in-out infinite;
  border-radius: 0.85rem;
}
.key-btn-capturing {
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-key-active) 25%, transparent);
}

/* ── Pop animation when a key is successfully captured ── */
@keyframes key-pop {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.12); }
  60%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}
.animate-key-pop {
  animation: key-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ── Swap transition for button content ── */
.key-swap-enter-active,
.key-swap-leave-active {
  transition: all 0.18s ease;
}
.key-swap-enter-from {
  opacity: 0;
  transform: translateY(6px) scale(0.92);
}
.key-swap-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.92);
}

/* ── Error slide-in ── */
.error-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.error-slide-leave-active {
  transition: all 0.2s ease-in;
}
.error-slide-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
.error-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>