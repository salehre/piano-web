<script setup lang="ts">
const { t } = useI18n()
const { ui, titleOf } = useSongText()
const { songs, songId, select, play } = useSongPlayer()
const { cue } = useUiSounds()

const dialog = ref<HTMLDialogElement | null>(null)
const open = ref(false)
// انتخابِ موقت داخل دیالوگ؛ تا زدن «پخش» روی صفحه اثری نداره
const pending = ref<string | null>(songId.value)
const titleId = useId()
const descId = useId()

function openDialog() {
  pending.value = songId.value
  open.value = true
  dialog.value?.showModal()
  cue('open')
}

function closeDialog() {
  if (dialog.value?.open) dialog.value.close()
}

// Esc، دکمه‌ی انصراف، ضربدر و پخش، همه از همین‌جا رد می‌شن
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
  const id = pending.value
  closeDialog()
  if (!id) return
  select(id)
  play()
}
</script>

<template>
  <div>
    <button
      type="button"
      class="flex items-center gap-2 rounded-lg px-3 py-2 border text-sm transition-colors hover:text-key-active"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="openDialog"
    >
      <svg class="size-4 text-stone-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M8 3v9.3A3 3 0 1 0 10 15V6.6l6-1.5V10a3 3 0 1 0 2 2.8V2z" />
      </svg>
      {{ ui.songs }}
    </button>

    <dialog
      ref="dialog"
      class="songs-dialog glass-card fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-xl p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm [--glass-radius:1.5rem]"
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
          class="absolute inset-e-4 top-4 grid size-8 place-items-center rounded-lg text-stone-400 transition-colors hover:text-key-active"
          :aria-label="t('ui.dismiss')"
          data-cuelume-close
          @click="closeDialog"
        >
          <svg class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M5 5l10 10M15 5 5 15" stroke-linecap="round" />
          </svg>
        </button>

        <h2 :id="titleId" class="pe-10 text-xl font-semibold">{{ ui.dialogTitle }}</h2>
        <p :id="descId" class="mt-2 text-sm text-stone-400">{{ ui.dialogSubtitle }}</p>

        <!-- لیست آهنگ‌ها؛ اگه زیاد بود اسکرول می‌شه -->
        <div
          role="radiogroup"
          :aria-labelledby="titleId"
          class="songs-list mt-6 max-h-[min(22rem,50vh)] space-y-2 overflow-y-auto pe-1"
        >
          <button
            v-for="s in songs"
            :key="s.id"
            type="button"
            role="radio"
            :aria-checked="pending === s.id"
            class="relative flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-start transition-all"
            :class="pending === s.id
              ? 'border-key-active bg-stone-800/60 shadow-[0_0_24px_-8px_var(--color-key-active)]'
              : 'border-stone-700/60 bg-stone-950/30 hover:border-stone-500 hover:bg-stone-800/40'"
            data-cuelume-select
            data-cuelume-emphasis="subtle"
            @click="pending = s.id"
            @dblclick="pending = s.id; apply()"
          >
            <span class="grid size-9 shrink-0 place-items-center rounded-full bg-stone-800/70 text-key-active">
              <svg class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M8 3v9.3A3 3 0 1 0 10 15V6.6l6-1.5V10a3 3 0 1 0 2 2.8V2z" />
              </svg>
            </span>

            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold">{{ titleOf(s) }}</span>
              <span class="block truncate text-xs text-stone-400">{{ s.composer }}</span>
            </span>

            <span class="shrink-0 rounded-md border border-stone-700/60 px-2 py-0.5 text-[11px] text-stone-300">
              {{ s.level === 1 ? ui.easy : ui.medium }}
            </span>

            <!-- تیک انتخاب -->
            <span
              class="grid size-5 shrink-0 place-items-center rounded-full"
              :class="pending === s.id ? 'bg-key-active text-stone-950' : 'border border-stone-600'"
              aria-hidden="true"
            >
              <svg v-if="pending === s.id" class="size-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.6">
                <path d="m5 10.5 3.5 3.5L15 7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
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
            class="rounded-xl bg-key-active px-4 py-3 text-sm font-semibold text-stone-950 transition-opacity hover:opacity-90 disabled:opacity-50"
            :disabled="!pending"
            data-cuelume-close
            data-cuelume-emphasis="strong"
            @click="apply"
          >
            {{ ui.playNow }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.songs-dialog[open] {
  animation: songs-dialog-in 0.18s ease-out;
}
.songs-dialog[open]::backdrop {
  animation: songs-dialog-fade 0.18s ease-out;
}

@keyframes songs-dialog-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }
}
@keyframes songs-dialog-fade {
  from {
    opacity: 0;
  }
}
</style>