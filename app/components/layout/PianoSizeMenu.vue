<script setup lang="ts">
const { t, n } = useI18n()
const piano = usePianoType()
const { cue } = useUiSounds()

const dialog = ref<HTMLDialogElement | null>(null)
const open = ref(false)
// انتخابِ موقت داخل دیالوگ؛ تا زدن «اعمال» روی پیانو اثری نداره
const pending = ref<number>(piano.value.keys)
const titleId = useId()
const descId = useId()

function openDialog() {
  pending.value = piano.value.keys
  open.value = true
  dialog.value?.showModal()
  cue('open')
}

function closeDialog() {
  if (dialog.value?.open) dialog.value.close()
}

// Esc، دکمه‌ی انصراف، ضربدر و اعمال، همه از همین‌جا رد می‌شن
function onNativeClose() {
  open.value = false
}

function onEsc() {
  cue('close', { emphasis: 'subtle' })
}

function onBackdropClick(e: MouseEvent) {
  if (e.target !== dialog.value) return
  closeDialog()
  cue('close', { emphasis: 'subtle' })
}

function apply() {
  const keys = pending.value
  closeDialog()
  if (keys !== piano.value.keys) {
    navigateTo({ path: '/virtual-piano', query: { keys } })
  }
}

// آیکون کیبورد: عرضش با تعداد کلیدها بیشتر می‌شه (۸۸ کلیدی پهن‌تر)
function iconWidth(keys: number) {
  const whites = buildKeys(PIANO_TYPES.find((p) => p.keys === keys)!).filter((k) => !k.isBlack).length
  return Math.round(28 + (whites - 15) * 0.9)
}
function iconWhites(width: number) {
  return Math.max(5, Math.round(width / 5))
}
// بعد از کلیدهای سفیدِ شماره‌ی ۰،۱،۳،۴،۵ (در هر اکتاو) کلید مشکی می‌آد
const BLACK_AFTER = new Set([0, 1, 3, 4, 5])
</script>

<template>
  <div>
    <button
      type="button"
      class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:text-key-active"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="openDialog"
    >
      <svg class="size-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <rect x="2.5" y="5" width="19" height="14" rx="2" />
        <path d="M8.8 5v14M15.2 5v14" stroke-linecap="round" />
        <path d="M7 5v7.5h3.6V5M13.4 5v7.5H17V5" fill="currentColor" stroke="none" />
      </svg>
      {{ t('piano.sizes') }}
    </button>

      <dialog
        ref="dialog"
        class="size-dialog glass-card m-auto w-[calc(100%-2rem)] max-w-xl bg-stone-900/90 p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm [--glass-radius:1.5rem]"
        :aria-labelledby="titleId"
        :aria-describedby="descId"
        @close="onNativeClose"
        @cancel="onEsc"
        @click="onBackdropClick"
      >
        <div class="relative p-6 sm:p-8">
          <!-- بستن -->
          <button
            type="button"
            class="absolute end-4 top-4 grid size-8 place-items-center rounded-lg text-stone-400 transition-colors hover:text-key-active"
            :aria-label="t('ui.dismiss')"
            data-cuelume-close
            @click="closeDialog"
          >
            <svg class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M5 5l10 10M15 5 5 15" stroke-linecap="round" />
            </svg>
          </button>

          <h2 :id="titleId" class="pe-10 text-xl font-semibold">{{ t('piano.sizeDialog.title') }}</h2>
          <p :id="descId" class="mt-2 text-sm text-stone-400">{{ t('piano.sizeDialog.subtitle') }}</p>

          <!-- کارت‌ها -->
          <div role="radiogroup" :aria-labelledby="titleId" class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <button
              v-for="p in PIANO_TYPES"
              :key="p.keys"
              type="button"
              role="radio"
              :aria-checked="pending === p.keys"
              class="relative flex flex-col items-center gap-3 rounded-2xl border px-3 py-6 text-center transition-all"
              :class="pending === p.keys
                ? 'border-key-active bg-stone-800/60 shadow-[0_0_24px_-8px_var(--color-key-active)]'
                : 'border-stone-700/60 bg-stone-950/30 hover:border-stone-500 hover:bg-stone-800/40'"
              data-cuelume-select
              data-cuelume-emphasis="subtle"
              @click="pending = p.keys"
            >
              <!-- تیک انتخاب -->
              <span
                v-if="pending === p.keys"
                class="absolute end-2.5 top-2.5 grid size-5 place-items-center rounded-full bg-key-active text-stone-950"
                aria-hidden="true"
              >
                <svg class="size-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.6">
                  <path d="m5 10.5 3.5 3.5L15 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>

              <!-- آیکون کیبورد -->
              <svg
                class="h-6 text-key-active"
                :style="{ width: iconWidth(p.keys) + 'px' }"
                :viewBox="`0 0 ${iconWidth(p.keys)} 24`"
                aria-hidden="true"
              >
                <rect x="0.75" y="0.75" :width="iconWidth(p.keys) - 1.5" height="22.5" rx="3" fill="currentColor" opacity="0.9" />
                <template v-for="i in iconWhites(iconWidth(p.keys)) - 1" :key="i">
                  <path
                    :d="`M${(i * (iconWidth(p.keys) / iconWhites(iconWidth(p.keys)))).toFixed(2)} 0.75V23.25`"
                    stroke="var(--color-stone-900)"
                    stroke-width="1"
                    opacity="0.55"
                  />
                  <rect
                    v-if="BLACK_AFTER.has((i - 1) % 7)"
                    :x="(i * (iconWidth(p.keys) / iconWhites(iconWidth(p.keys))) - 1.4).toFixed(2)"
                    y="0.75"
                    width="2.8"
                    height="13"
                    rx="0.8"
                    fill="var(--color-stone-950)"
                  />
                </template>
              </svg>

              <span class="font-semibold">{{ t('piano.keys', { n: n(p.keys) }) }}</span>
              <span class="-mt-1 text-xs text-stone-400">{{ t('piano.rangeShort', { from: p.from, to: p.to }) }}</span>
            </button>
          </div>

          <!-- دکمه‌ها -->
          <div class="mt-8 grid grid-cols-[1fr_1.4fr] gap-3 sm:gap-4">
            <button
              type="button"
              class="rounded-xl border border-stone-700/60 bg-stone-950/30 px-4 py-3 text-sm font-medium transition-colors hover:bg-stone-800/60"
              data-cuelume-close
              @click="closeDialog"
            >
              {{ t('ui.cancel') }}
            </button>
            <button
              type="button"
              class="rounded-xl bg-key-active px-4 py-3 text-sm font-semibold text-stone-950 transition-opacity hover:opacity-90"
              data-cuelume-close
              data-cuelume-emphasis="strong"
              @click="apply"
            >
              {{ t('piano.sizeDialog.apply') }}
            </button>
          </div>
        </div>
      </dialog>
  </div>
</template>

<style scoped>
.size-dialog[open] {
  animation: size-dialog-in 0.18s ease-out;
}
.size-dialog[open]::backdrop {
  animation: size-dialog-fade 0.18s ease-out;
}

@keyframes size-dialog-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }
}
@keyframes size-dialog-fade {
  from {
    opacity: 0;
  }
}
</style>