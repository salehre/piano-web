<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const { t, n } = useI18n()
const { bindings, setBinding, clearBinding, resetBindings } = useKeyBindings()
const tr = useTr()

// خطای هر نت (مثلاً کلید تکراری)؛ ارجاع به پیام نگه داشته می‌شه تا با عوض شدن زبان ترجمه‌اش عوض بشه
const errors = ref<Record<string, MessageRef>>({})
const shakeSeed = ref<Record<string, number>>({})
const justSaved = ref<Record<string, boolean>>({})
const showResetConfirm = ref(false)

// --- UX states ---
const search = ref('')
const filterMode = ref<'all' | 'assigned' | 'unassigned'>('all')
const collapsed = ref<Record<number, boolean>>({})
const showToast = ref(false)
const toastMsg = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

const totalKeys = NOTE_GROUPS.reduce((sum, g) => sum + g.notes.length, 0)

const allNotes = computed(() => NOTE_GROUPS.flatMap(g => g.notes))
const totalAssigned = computed(() => allNotes.value.filter(note => bindings.value[note]).length)
const remainingCount = computed(() => totalKeys - totalAssigned.value)
const progressPercent = computed(() => totalKeys === 0 ? 0 : Math.round((totalAssigned.value / totalKeys) * 100))
const octavesComplete = computed(() => NOTE_GROUPS.filter(g => g.notes.length > 0 && g.notes.every(note => bindings.value[note])).length)

/** تعداد نت‌های تنظیم‌شده‌ی هر اکتاو */
function assignedCount(notes: string[]) {
  return notes.filter(note => bindings.value[note]).length
}

function octaveProgress(notes: string[]) {
  if (!notes.length) return 0
  return (assignedCount(notes) / notes.length) * 100
}

const filteredGroups = computed(() => {
  const q = search.value.trim().toLowerCase()
  return NOTE_GROUPS.map(g => {
    let notes = g.notes
    if (q) notes = notes.filter(note => note.toLowerCase().includes(q))
    if (filterMode.value === 'assigned') notes = notes.filter(note => !!bindings.value[note])
    if (filterMode.value === 'unassigned') notes = notes.filter(note => !bindings.value[note])
    return { ...g, notes }
  }).filter(g => g.notes.length > 0)
})

const hasActiveFilter = computed(() => search.value.trim() !== '' || filterMode.value !== 'all')

const filterOptions = computed(() => [
  { value: 'all' as const, label: t('settings.shortcuts.filterAll'), count: totalKeys },
  { value: 'assigned' as const, label: t('settings.shortcuts.filterAssigned'), count: totalAssigned.value },
  { value: 'unassigned' as const, label: t('settings.shortcuts.filterUnassigned'), count: remainingCount.value },
])

function toggleOctave(octave: number) {
  collapsed.value[octave] = !collapsed.value[octave]
}
function expandAll() {
  collapsed.value = {}
}
function collapseAll() {
  const o: Record<number, boolean> = {}
  NOTE_GROUPS.forEach(g => (o[g.octave] = true))
  collapsed.value = o
}
function clearFilters() {
  search.value = ''
  filterMode.value = 'all'
}

function setCode(note: string, code: string) {
  const clash = Object.entries(bindings.value).find(([nn, cc]) => cc === code && nn !== note)
  if (clash) {
    errors.value[note] = msgRef('settings.shortcuts.clash', { key: formatKeyCode(code), note: clash[0] })
    shakeSeed.value[note] = (shakeSeed.value[note] || 0) + 1
    return
  }
  delete errors.value[note]
  setBinding(note, code)
  justSaved.value[note] = true
  setTimeout(() => delete justSaved.value[note], 1400)
}

function clear(note: string) {
  delete errors.value[note]
  clearBinding(note)
}

let toastTimer: ReturnType<typeof setTimeout> | undefined
function showToastMsg(msg: string) {
  toastMsg.value = msg
  showToast.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (showToast.value = false), 2600)
}

function reset() {
  errors.value = {}
  shakeSeed.value = {}
  resetBindings()
  showResetConfirm.value = false
  showToastMsg(t('settings.shortcuts.resetSuccess'))
}

// میانبر `/` برای فوکوس سرچ
function onGlobalKey(e: KeyboardEvent) {
  if (e.key === '/' && !showResetConfirm.value) {
    const el = document.activeElement as HTMLElement | null
    const isTyping = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
    if (!isTyping) {
      e.preventDefault()
      searchInput.value?.focus()
    }
  }
}
onMounted(() => window.addEventListener('keydown', onGlobalKey))
onUnmounted(() => window.removeEventListener('keydown', onGlobalKey))
</script>

<template>
  <section aria-labelledby="shortcuts-title" class="relative isolate">
    <!-- بک‌گراند دکوراتیو -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div class="animate-float absolute -top-24 start-1/4 h-64 w-64 rounded-full bg-key-active/10 blur-3xl" />
      <div class="animate-float-delayed absolute -end-20 top-40 h-72 w-72 rounded-full bg-primary-400/10 blur-3xl" />
      <div class="absolute -start-10 bottom-0 h-48 w-96 rounded-full bg-key-active/[0.06] blur-3xl" />
      <div class="bg-grid absolute inset-0" />
    </div>

    <!-- هدر -->
    <div class="animate-rise flex flex-wrap items-start justify-between gap-4">
      <div class="flex max-w-xl items-start gap-4">
        <div class="relative shrink-0">
          <div class="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-key-active via-primary-400 to-key-active text-stone-950 shadow-lg shadow-key-active/20 ring-1 ring-white/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M18 12h.01M7 16h10" />
            </svg>
          </div>
          <span class="absolute -bottom-1.5 -end-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-emerald-400 px-1 text-[11px] font-bold tabular-nums text-stone-950 ring-4 ring-stone-950">
            {{ n(totalAssigned) }}
          </span>
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h3 id="shortcuts-title" class="text-lg font-semibold tracking-tight text-stone-100">
              {{ t('settings.shortcuts.title') }}
            </h3>
            <span class="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-stone-300">
              {{ n(totalKeys) }}
            </span>
          </div>
          <p class="mt-1.5 text-sm leading-6 text-stone-400">
            {{ t('settings.shortcuts.description', { total: n(totalKeys) }) }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div class="hidden items-center gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-1 sm:flex">
          <button type="button" class="rounded-lg px-2.5 py-1.5 text-xs text-stone-400 transition hover:bg-white/5 hover:text-stone-200 active:scale-95" @click="expandAll">
            {{ t('settings.shortcuts.expandAll') }}
          </button>
          <span class="h-4 w-px bg-white/5" />
          <button type="button" class="rounded-lg px-2.5 py-1.5 text-xs text-stone-400 transition hover:bg-white/5 hover:text-stone-200 active:scale-95" @click="collapseAll">
            {{ t('settings.shortcuts.collapseAll') }}
          </button>
        </div>

        <button
          type="button"
          class="group inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] px-4 py-2.5 text-sm font-medium text-rose-200 transition-all duration-300 hover:border-rose-500/40 hover:bg-rose-500/[0.12] hover:shadow-lg hover:shadow-rose-500/10 active:scale-95"
          @click="showResetConfirm = true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          {{ t('settings.shortcuts.reset') }}
        </button>
      </div>
    </div>

    <!-- کارت پیشرفت کلی -->
    <div class="animate-rise mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-stone-900/90 via-stone-900/60 to-stone-950/90 p-5 shadow-xl shadow-black/20 backdrop-blur" style="animation-delay: 80ms">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="h-9 w-1 rounded-full bg-gradient-to-b from-key-active to-primary-400" />
          <div>
            <p class="text-sm font-medium text-stone-200">
              {{ t('settings.shortcuts.totalProgress') }}
            </p>
            <p class="mt-0.5 text-xs tabular-nums text-stone-500">
              {{ t('settings.shortcuts.assignedOf', { set: n(totalAssigned), total: n(totalKeys) }) }}
            </p>
          </div>
        </div>
        <p class="bg-gradient-to-r from-key-active to-primary-400 bg-clip-text text-2xl font-bold tabular-nums text-transparent">
          {{ n(progressPercent) }}%
        </p>
      </div>

      <div dir="ltr" class="mt-4 h-2.5 overflow-hidden rounded-full bg-stone-800/80 ring-1 ring-white/5">
        <div class="progress-fill h-full rounded-full bg-gradient-to-r from-key-active via-primary-400 to-key-active" :style="{ width: progressPercent + '%' }" />
      </div>

      <div class="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
        <div class="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.06] px-3 py-2.5 text-center transition-colors hover:bg-emerald-500/[0.09]">
          <p class="text-lg font-bold tabular-nums text-emerald-300">{{ n(totalAssigned) }}</p>
          <p class="mt-0.5 text-[11px] text-stone-500">{{ t('settings.shortcuts.statAssigned') }}</p>
        </div>
        <div class="rounded-xl border border-primary-400/10 bg-primary-400/[0.06] px-3 py-2.5 text-center transition-colors hover:bg-primary-400/[0.09]">
          <p class="text-lg font-bold tabular-nums text-primary-400">{{ n(remainingCount) }}</p>
          <p class="mt-0.5 text-[11px] text-stone-500">{{ t('settings.shortcuts.statRemaining') }}</p>
        </div>
        <div class="rounded-xl border border-key-active/10 bg-key-active/[0.06] px-3 py-2.5 text-center transition-colors hover:bg-key-active/[0.09]">
          <p class="text-lg font-bold tabular-nums text-key-active">{{ n(octavesComplete) }}/{{ n(NOTE_GROUPS.length) }}</p>
          <p class="mt-0.5 text-[11px] text-stone-500">{{ t('settings.shortcuts.statOctaves') }}</p>
        </div>
      </div>
    </div>

    <!-- تولبار سرچ + فیلتر -->
    <div class="animate-rise mt-4 flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-stone-950/70 p-3 shadow-lg shadow-black/10 backdrop-blur-xl sm:flex-row sm:items-center" style="animation-delay: 140ms">
      <div class="relative flex-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          :placeholder="t('settings.shortcuts.searchPlaceholder')"
          class="w-full rounded-xl border border-stone-800 bg-stone-900/60 py-2.5 pe-16 ps-10 text-sm text-stone-200 outline-none transition-all duration-300 placeholder:text-stone-600 focus:border-primary-400/50 focus:bg-stone-900 focus:ring-4 focus:ring-primary-400/10"
          @keydown.escape="search = ''"
        />
        <button v-if="search" type="button" class="absolute end-9 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-white/5 text-stone-400 transition hover:bg-white/10 hover:text-stone-200" @click="search = ''" :aria-label="t('settings.shortcuts.clearSearch')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="h-3.5 w-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
        <kbd class="kbd absolute end-3 top-1/2 -translate-y-1/2">/</kbd>
      </div>

      <div class="flex items-center gap-1 rounded-xl bg-stone-900/80 p-1 ring-1 ring-white/5">
        <button
          v-for="opt in filterOptions"
          :key="opt.value"
          type="button"
          class="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-300 active:scale-95 sm:flex-none"
          :class="filterMode === opt.value ? 'bg-gradient-to-r from-key-active to-primary-400 text-stone-950 shadow-lg shadow-key-active/20' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'"
          @click="filterMode = opt.value"
        >
          {{ opt.label }}
          <span class="rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums" :class="filterMode === opt.value ? 'bg-white/20 text-white' : 'bg-white/5 text-stone-500'">
            {{ n(opt.count) }}
          </span>
        </button>
      </div>
    </div>

    <!-- گروه اکتاوها -->
    <div class="mt-5 space-y-4">
      <section
        v-for="(g, gi) in filteredGroups"
        :key="g.octave"
        :aria-labelledby="`octave-${g.octave}`"
        class="animate-rise group/card overflow-hidden rounded-2xl border border-stone-800/70 bg-stone-900/40 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-stone-700/90 hover:shadow-xl hover:shadow-black/30"
        :style="{ animationDelay: `${180 + gi * 70}ms` }"
      >
        <button type="button" class="flex w-full items-center justify-between gap-4 p-4 text-start transition-colors hover:bg-white/[0.02]" :aria-expanded="!collapsed[g.octave]" @click="toggleOctave(g.octave)">
          <div class="flex min-w-0 items-center gap-3.5">
            <div class="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 text-sm font-bold tabular-nums text-stone-200 ring-1 ring-white/10 transition-transform duration-300 group-hover/card:scale-105">
              <span class="absolute inset-0 bg-gradient-to-br from-key-active/20 to-primary-400/20 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
              <span class="relative">{{ n(g.octave) }}</span>
            </div>
            <div class="min-w-0">
              <h4 :id="`octave-${g.octave}`" class="truncate text-sm font-semibold text-stone-100">
                {{ t('settings.shortcuts.octave', { n: n(g.octave) }) }}
              </h4>
              <div class="mt-1.5 flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tabular-nums ring-1 transition-colors"
                  :class="assignedCount(g.notes) === g.notes.length ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20' : assignedCount(g.notes) === 0 ? 'bg-stone-800/80 text-stone-400 ring-white/5' : 'bg-primary-400/10 text-primary-400 ring-primary-400/20'"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current" :class="assignedCount(g.notes) > 0 && assignedCount(g.notes) < g.notes.length ? 'animate-pulse' : ''" />
                  {{ t('settings.shortcuts.assigned', { set: n(assignedCount(g.notes)), total: n(g.notes.length) }) }}
                </span>
                <span v-if="assignedCount(g.notes) === g.notes.length" class="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M20 6 9 17l-5-5" /></svg>
                  {{ t('settings.shortcuts.complete') }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-4">
            <div dir="ltr" class="hidden w-28 sm:block">
              <div class="h-1.5 overflow-hidden rounded-full bg-stone-800">
                <div class="h-full rounded-full bg-gradient-to-r from-key-active to-primary-400 transition-all duration-700" :style="{ width: octaveProgress(g.notes) + '%' }" />
              </div>
              <p class="mt-1 text-end text-[11px] tabular-nums text-stone-500">{{ n(Math.round(octaveProgress(g.notes))) }}%</p>
            </div>
            <span class="grid h-8 w-8 place-items-center rounded-full border border-white/5 bg-white/[0.03] text-stone-400 transition-all duration-300" :class="{ 'rotate-180 bg-white/[0.06]': collapsed[g.octave] }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m6 9 6 6 6-6" /></svg>
            </span>
          </div>
        </button>

        <div class="collapse-wrap" :class="{ collapsed: collapsed[g.octave] }">
          <div class="overflow-hidden">
            <div class="border-t border-white/[0.04] px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
              <ul class="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-1.5">
                <li v-for="(note, ni) in g.notes" :key="note" class="animate-rise" :style="{ animationDelay: `${ni * 35}ms` }">
                  <div
                    :key="shakeSeed[note] || 0"
                    class="rounded-xl transition-all duration-300"
                    :class="[
                      errors[note]
                        ? 'animate-shake bg-rose-500/[0.07] ring-1 ring-rose-500/30'
                        : justSaved[note]
                          ? 'bg-emerald-500/[0.07] shadow-[0_0_24px_-8px_rgba(16,185,129,0.4)] ring-1 ring-emerald-500/30'
                          : 'hover:bg-white/[0.03] hover:ring-1 hover:ring-white/[0.06]',
                    ]"
                  >
                    <SettingsKeyBindingRow
                      :note="note"
                      :code="bindings[note] ?? null"
                      :error="tr(errors[note])"
                      @update:code="setCode(note, $event)"
                      @clear="clear(note)"
                    />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- حالت خالی -->
      <Transition name="fade">
        <div v-if="!filteredGroups.length" class="animate-pop relative overflow-hidden rounded-2xl border border-dashed border-stone-700/60 bg-stone-900/30 px-6 py-16 text-center">
          <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-stone-800/80 text-stone-500 ring-1 ring-white/5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M8 8l6 6M14 8l-6 6" />
            </svg>
          </div>
          <h4 class="mt-4 font-medium text-stone-200">
            {{ t('settings.shortcuts.noResultsTitle') }}
          </h4>
          <p class="mx-auto mt-1 max-w-sm text-sm leading-6 text-stone-500">
            {{ t('settings.shortcuts.noResultsDesc') }}
          </p>
          <button v-if="hasActiveFilter" type="button" class="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200 transition-all hover:bg-white/10 active:scale-95" @click="clearFilters">
            {{ t('settings.shortcuts.clearFilters') }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- راهنما -->
    <div class="animate-rise mt-6 flex items-start gap-3.5 rounded-2xl border border-key-active/10 bg-gradient-to-br from-key-active/[0.07] to-primary-400/[0.05] p-4 sm:p-5" style="animation-delay: 320ms">
      <div class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-key-active/15 text-key-active ring-1 ring-key-active/20">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4.5 w-4.5 h-5 w-5">
          <path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.5 1 2.5h6c0-1 .2-1.8 1-2.5A6 6 0 0 0 12 3z" />
        </svg>
      </div>
      <div class="text-sm leading-6">
        <p class="font-medium text-stone-200">
          {{ t('settings.shortcuts.tipTitle') }}
        </p>
        <p class="mt-0.5 text-stone-400">
          {{ t('settings.shortcuts.tipDesc') }}
        </p>
      </div>
    </div>

    <UiConfirmDialog
      v-model="showResetConfirm"
      :title="t('settings.shortcuts.resetTitle')"
      :message="t('settings.shortcuts.resetMessage')"
      :confirm-label="t('settings.shortcuts.resetConfirm')"
      :cancel-label="t('settings.shortcuts.resetCancel')"
      @confirm="reset"
    />

    <Teleport to="body">
      <Transition name="toast">
        <div v-if="showToast" class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-stone-900/90 py-3 pe-5 ps-4 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl">
          <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500 text-stone-950">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M20 6 9 17l-5-5" /></svg>
          </span>
          <p class="whitespace-nowrap text-sm font-medium text-stone-200">{{ toastMsg }}</p>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.bg-grid {
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent);
}

.collapse-wrap {
  display: grid;
  grid-template-rows: 1fr;
  transition:
    grid-template-rows 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.4s ease;
}
.collapse-wrap.collapsed {
  grid-template-rows: 0fr;
  opacity: 0;
}

.kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.4rem;
  border-radius: 0.5rem;
  font-size: 11px;
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom-width: 2px;
  color: #e7e5e4;
}

.progress-fill {
  position: relative;
  overflow: hidden;
  transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
.progress-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: translateX(-100%);
  animation: shine 2.8s ease-in-out infinite;
}

@keyframes rise {
  from { opacity: 0; transform: translateY(14px) scale(0.98); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
@keyframes pop {
  0% { opacity: 0; transform: scale(0.94) translateY(8px); }
  60% { opacity: 1; transform: scale(1.01) translateY(0); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes shakeX {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(2px); }
}
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-18px) scale(1.05); }
}
@keyframes shine {
  0% { transform: translateX(-100%); }
  60%, 100% { transform: translateX(100%); }
}

.animate-rise { animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
.animate-pop { animation: pop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
.animate-shake { animation: shakeX 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97); }
.animate-float { animation: float 8s ease-in-out infinite; }
.animate-float-delayed { animation: float 10s ease-in-out infinite; animation-delay: -4s; }

.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(8px) scale(0.98); }

.toast-enter-active { transition: all 0.45s cubic-bezier(0.22, 1, 0.36, 1); }
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 16px) scale(0.95); }

input[type='search']::-webkit-search-cancel-button { display: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>