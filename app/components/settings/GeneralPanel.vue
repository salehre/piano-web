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
  <section aria-labelledby="shortcuts-title" class="relative isolate p-2 sm:p-4">
    <!-- بک‌گراند دکوراتیو -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div class="animate-orbit-1 absolute -top-24 start-1/4 h-64 w-64 rounded-full bg-key-active/10 blur-3xl" />
      <div class="animate-orbit-2 absolute -end-20 top-40 h-72 w-72 rounded-full bg-primary-400/10 blur-3xl" />
      <div class="animate-orbit-3 absolute -start-10 bottom-0 h-48 w-96 rounded-full bg-key-active/[0.06] blur-3xl" />
      <div class="animate-aurora absolute inset-0 opacity-30" />
      <div class="bg-grid absolute inset-0" />
    </div>

    <!-- هدر -->
    <div class="animate-rise flex flex-wrap items-start justify-between gap-4">
      <div class="flex max-w-xl items-start gap-4">
        <div class="relative shrink-0">
          <div class="icon-glow grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-key-active via-primary-400 to-key-active text-stone-950 shadow-lg shadow-key-active/20 ring-1 ring-white/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M18 12h.01M7 16h10" />
            </svg>
          </div>
          <!-- <span class="badge-pulse absolute -bottom-1.5 -end-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-emerald-400 px-1 text-[11px] font-bold tabular-nums text-stone-950 ring-4 ring-stone-950">
            {{ n(totalAssigned) }}
          </span> -->
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
          <button type="button" class="btn-ripple rounded-lg px-2.5 py-1.5 text-xs text-stone-400 transition hover:bg-white/5 hover:text-stone-200 active:scale-95" @click="expandAll">
            {{ t('settings.shortcuts.expandAll') }}
          </button>
          <span class="h-4 w-px bg-white/5" />
          <button type="button" class="btn-ripple rounded-lg px-2.5 py-1.5 text-xs text-stone-400 transition hover:bg-white/5 hover:text-stone-200 active:scale-95" @click="collapseAll">
            {{ t('settings.shortcuts.collapseAll') }}
          </button>
        </div>

        <button
          type="button"
          class="btn-ripple group inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] px-4 py-2.5 text-sm font-medium text-rose-200 transition-all duration-300 hover:border-rose-500/40 hover:bg-rose-500/[0.12] hover:shadow-lg hover:shadow-rose-500/10 active:scale-95"
          @click="showResetConfirm = true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-[360deg]">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          {{ t('settings.shortcuts.reset') }}
        </button>
      </div>
    </div>

    <!-- کارت پیشرفت کلی -->
    <div class="animate-rise mt-6  overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-stone-900/90 via-stone-900/60 to-stone-950/90 p-5 shadow-xl shadow-black/20 backdrop-blur" style="animation-delay: 80ms">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="h-9 w-1 rounded-full bg-gradient-to-b from-key-active to-primary-400 animate-gradient-flow" />
          <div>
            <p class="text-sm font-medium text-stone-200">
              {{ t('settings.shortcuts.totalProgress') }}
            </p>
            <p class="mt-0.5 text-xs tabular-nums text-stone-500">
              {{ t('settings.shortcuts.assignedOf', { set: n(totalAssigned), total: n(totalKeys) }) }}
            </p>
          </div>
        </div>
        <p class="animate-number-glow bg-gradient-to-r from-key-active to-primary-400 bg-clip-text text-2xl font-bold tabular-nums text-transparent">
          {{ n(progressPercent) }}%
        </p>
      </div>

      <div dir="ltr" class="mt-4 h-2.5 overflow-hidden rounded-full bg-stone-800/80 ring-1 ring-white/5">
        <div class="progress-fill h-full rounded-full bg-gradient-to-r from-key-active via-primary-400 to-key-active" :style="{ width: progressPercent + '%' }" />
      </div>

      <div class="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
        <div class="stat-card rounded-xl border border-emerald-500/10 bg-emerald-500/[0.06] px-3 py-2.5 text-center transition-all duration-500 hover:bg-emerald-500/[0.09] hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5">
          <p class="text-lg font-bold tabular-nums text-emerald-300">{{ n(totalAssigned) }}</p>
          <p class="mt-0.5 text-[11px] text-stone-500">{{ t('settings.shortcuts.statAssigned') }}</p>
        </div>
        <div class="stat-card rounded-xl border border-primary-400/10 bg-primary-400/[0.06] px-3 py-2.5 text-center transition-all duration-500 hover:bg-primary-400/[0.09] hover:shadow-lg hover:shadow-primary-400/5 hover:-translate-y-0.5">
          <p class="text-lg font-bold tabular-nums text-primary-400">{{ n(remainingCount) }}</p>
          <p class="mt-0.5 text-[11px] text-stone-500">{{ t('settings.shortcuts.statRemaining') }}</p>
        </div>
        <div class="stat-card rounded-xl border border-key-active/10 bg-key-active/[0.06] px-3 py-2.5 text-center transition-all duration-500 hover:bg-key-active/[0.09] hover:shadow-lg hover:shadow-key-active/5 hover:-translate-y-0.5">
          <p class="text-lg font-bold tabular-nums text-key-active">{{ n(octavesComplete) }}/{{ n(NOTE_GROUPS.length) }}</p>
          <p class="mt-0.5 text-[11px] text-stone-500">{{ t('settings.shortcuts.statOctaves') }}</p>
        </div>
      </div>
    </div>

    <!-- تولبار سرچ + فیلتر -->
    <div class="animate-rise mt-4 flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-stone-950/70 p-3 shadow-lg shadow-black/10 backdrop-blur-xl sm:flex-row sm:items-center" style="animation-delay: 140ms">
      <div class="relative flex-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500 transition-colors duration-300 peer-focus:text-primary-400">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          :placeholder="t('settings.shortcuts.searchPlaceholder')"
          class="peer w-full rounded-xl border border-stone-800 bg-stone-900/60 py-2.5 pe-16 ps-10 text-sm text-stone-200 outline-none transition-all duration-500 placeholder:text-stone-600 focus:border-primary-400/50 focus:bg-stone-900 focus:ring-4 focus:ring-primary-400/10 focus:shadow-lg focus:shadow-primary-400/5"
          @keydown.escape="search = ''"
        />
        <button v-if="search" type="button" class="absolute end-9 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-white/5 text-stone-400 transition-all duration-300 hover:bg-white/10 hover:text-stone-200 hover:rotate-90 active:scale-90" @click="search = ''" :aria-label="t('settings.shortcuts.clearSearch')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="h-3.5 w-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
        <kbd class="kbd absolute end-3 top-1/2 -translate-y-1/2 animate-kbd-breathe">/</kbd>
      </div>

      <div class="flex items-center gap-1 rounded-xl bg-stone-900/80 p-1 ring-1 ring-white/5">
        <button
          v-for="opt in filterOptions"
          :key="opt.value"
          type="button"
          class="filter-btn relative flex flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-lg px-3 py-2 text-xs font-medium transition-all duration-500 active:scale-95 sm:flex-none"
          :class="filterMode === opt.value ? 'text-stone-950 shadow-lg shadow-key-active/20' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'"
          @click="filterMode = opt.value"
        >
          <span v-if="filterMode === opt.value" class="filter-active-bg absolute inset-0 rounded-lg bg-gradient-to-r from-key-active to-primary-400" />
          <span class="relative z-10 flex items-center gap-1.5">
            {{ opt.label }}
            <span class="rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums transition-colors duration-300" :class="filterMode === opt.value ? 'bg-white/20 text-white' : 'bg-white/5 text-stone-500'">
              {{ n(opt.count) }}
            </span>
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
        class="animate-rise group/card overflow-hidden rounded-2xl border border-stone-800/70 bg-stone-900/40 shadow-sm backdrop-blur-sm transition-all duration-500 hover:border-stone-700/90 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-0.5"
        :style="{ animationDelay: `${180 + gi * 70}ms` }"
      >
        <button type="button" class="flex w-full items-center justify-between gap-4 p-4 text-start transition-colors duration-300 hover:bg-white/[0.02]" :aria-expanded="!collapsed[g.octave]" @click="toggleOctave(g.octave)">
          <div class="flex min-w-0 items-center gap-3.5">
            <div class="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 text-sm font-bold tabular-nums text-stone-200 ring-1 ring-white/10 transition-all duration-500 group-hover/card:scale-110 group-hover/card:shadow-lg group-hover/card:shadow-key-active/10">
              <span class="absolute inset-0 bg-gradient-to-br from-key-active/20 to-primary-400/20 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
              <span class="absolute inset-0 animate-shimmer opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
              <span class="relative">{{ n(g.octave) }}</span>
            </div>
            <div class="min-w-0">
              <h4 :id="`octave-${g.octave}`" class="truncate text-sm font-semibold text-stone-100">
                {{ t('settings.shortcuts.octave', { n: n(g.octave) }) }}
              </h4>
              <div class="mt-1.5 flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tabular-nums ring-1 transition-all duration-500"
                  :class="assignedCount(g.notes) === g.notes.length ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20 shadow-sm shadow-emerald-500/10' : assignedCount(g.notes) === 0 ? 'bg-stone-800/80 text-stone-400 ring-white/5' : 'bg-primary-400/10 text-primary-400 ring-primary-400/20'"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current" :class="assignedCount(g.notes) > 0 && assignedCount(g.notes) < g.notes.length ? 'animate-pulse-glow' : ''" />
                  {{ t('settings.shortcuts.assigned', { set: n(assignedCount(g.notes)), total: n(g.notes.length) }) }}
                </span>
                <span v-if="assignedCount(g.notes) === g.notes.length" class="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 animate-check-pop">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M20 6 9 17l-5-5" /></svg>
                  {{ t('settings.shortcuts.complete') }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-4">
            <div dir="ltr" class="hidden w-28 sm:block">
              <div class="h-1.5 overflow-hidden rounded-full bg-stone-800">
                <div class="h-full rounded-full bg-gradient-to-r from-key-active to-primary-400 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]" :style="{ width: octaveProgress(g.notes) + '%' }" />
              </div>
              <p class="mt-1 text-end text-[11px] tabular-nums text-stone-500">{{ n(Math.round(octaveProgress(g.notes))) }}%</p>
            </div>
            <span class="grid h-8 w-8 place-items-center rounded-full border border-white/5 bg-white/[0.03] text-stone-400 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" :class="{ 'rotate-180 bg-white/[0.06] text-stone-200': collapsed[g.octave] }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m6 9 6 6 6-6" /></svg>
            </span>
          </div>
        </button>

        <div class="collapse-wrap" :class="{ collapsed: collapsed[g.octave] }">
          <div class="overflow-hidden">
            <div class="border-t border-white/[0.04] px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
              <ul class="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-1.5">
                <li v-for="(note, ni) in g.notes" :key="note" class="animate-stagger-rise" :style="{ animationDelay: `${ni * 40}ms` }">
                  <div
                    :key="shakeSeed[note] || 0"
                    class="rounded-xl transition-all duration-500"
                    :class="[
                      errors[note]
                        ? 'animate-shake-spring bg-rose-500/[0.07] ring-1 ring-rose-500/30 shadow-lg shadow-rose-500/10'
                        : justSaved[note]
                          ? 'animate-save-flash bg-emerald-500/[0.07] shadow-[0_0_32px_-8px_rgba(16,185,129,0.5)] ring-1 ring-emerald-500/30'
                          : 'hover:bg-white/[0.03] hover:ring-1 hover:ring-white/[0.06] hover:shadow-md hover:shadow-black/10 hover:-translate-y-px',
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
          <div class="animate-empty-float mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-stone-800/80 text-stone-500 ring-1 ring-white/5">
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
          <button v-if="hasActiveFilter" type="button" class="btn-ripple mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200 transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:shadow-white/5 active:scale-95" @click="clearFilters">
            {{ t('settings.shortcuts.clearFilters') }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- راهنما -->
    <div class="animate-rise mt-6 flex items-start gap-3.5 rounded-2xl border border-key-active/10 bg-gradient-to-br from-key-active/[0.07] to-primary-400/[0.05] p-4 sm:p-5 animate-tip-glow" style="animation-delay: 320ms">
      <div class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-key-active/15 text-key-active ring-1 ring-key-active/20 animate-icon-breathe">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
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
          <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500 text-stone-950 animate-toast-check">
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

/* ─── Aurora background ─── */
.animate-aurora {
  background: linear-gradient(
    135deg,
    transparent 20%,
    rgba(16, 185, 129, 0.03) 40%,
    rgba(99, 102, 241, 0.04) 60%,
    transparent 80%
  );
  background-size: 400% 400%;
  animation: aurora 15s ease-in-out infinite;
}

/* ─── Orbital floating blobs ─── */
.animate-orbit-1 {
  animation: orbit1 12s ease-in-out infinite;
}
.animate-orbit-2 {
  animation: orbit2 16s ease-in-out infinite;
}
.animate-orbit-3 {
  animation: orbit3 20s ease-in-out infinite;
}

/* ─── Collapse ─── */
.collapse-wrap {
  display: grid;
  grid-template-rows: 1fr;
  transition:
    grid-template-rows 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.4s ease;
}
.collapse-wrap.collapsed {
  grid-template-rows: 0fr;
  opacity: 0;
}

/* ─── Kbd ─── */
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

/* ─── Progress bar ─── */
.progress-fill {
  position: relative;
  overflow: hidden;
  transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
  background-size: 200% 100%;
  animation: gradient-shift 3s ease-in-out infinite;
}
.progress-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 20%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0.15) 80%,
    transparent 100%
  );
  transform: translateX(-100%);
  animation: shine 3.2s ease-in-out infinite;
}

/* ─── Shimmer overlay ─── */
.animate-shimmer {
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.08) 45%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.08) 55%,
    transparent 60%
  );
  background-size: 250% 100%;
  animation: shimmer 2s ease-in-out infinite;
}

/* ─── Filter button active bg ─── */
.filter-active-bg {
  animation: filter-slide-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ═══════════════════════════════════════════
   KEYFRAMES
   ═══════════════════════════════════════════ */

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes stagger-rise {
  from {
    opacity: 0;
    transform: translateY(12px) translateX(-6px) scale(0.96);
    filter: blur(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(0) scale(1);
    filter: blur(0);
  }
}

@keyframes pop {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(12px);
    filter: blur(4px);
  }
  50% {
    opacity: 1;
    transform: scale(1.02) translateY(-2px);
    filter: blur(0);
  }
  75% {
    transform: scale(0.99) translateY(1px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
}

@keyframes shake-spring {
  0% { transform: translateX(0); }
  10% { transform: translateX(-8px) rotate(-1deg); }
  20% { transform: translateX(7px) rotate(0.8deg); }
  30% { transform: translateX(-5px) rotate(-0.5deg); }
  40% { transform: translateX(4px) rotate(0.3deg); }
  50% { transform: translateX(-2px); }
  60% { transform: translateX(1.5px); }
  75% { transform: translateX(-0.5px); }
  100% { transform: translateX(0); }
}

@keyframes orbit1 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  25% { transform: translate(30px, -25px) scale(1.08) rotate(5deg); }
  50% { transform: translate(-15px, -40px) scale(0.95) rotate(-3deg); }
  75% { transform: translate(20px, -10px) scale(1.04) rotate(2deg); }
}

@keyframes orbit2 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  25% { transform: translate(-25px, 20px) scale(1.06) rotate(-4deg); }
  50% { transform: translate(20px, 35px) scale(0.92) rotate(6deg); }
  75% { transform: translate(-10px, 15px) scale(1.03) rotate(-2deg); }
}

@keyframes orbit3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -15px) scale(1.1); }
  66% { transform: translate(-20px, 10px) scale(0.9); }
}

@keyframes aurora {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  50%, 100% { transform: translateX(100%); }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes gradient-flow {
  0%, 100% { opacity: 0.7; transform: scaleY(1); }
  50% { opacity: 1; transform: scaleY(1.15); }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 currentColor;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    box-shadow: 0 0 8px 2px currentColor;
    transform: scale(1.6);
  }
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4); }
  50% { transform: scale(1.08); box-shadow: 0 0 12px 3px rgba(52, 211, 153, 0.15); }
}

@keyframes icon-breathe {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.06); opacity: 1; }
}

@keyframes icon-glow {
  0%, 100% { box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15), 0 0 0 0 rgba(16, 185, 129, 0); }
  50% { box-shadow: 0 4px 20px rgba(16, 185, 129, 0.25), 0 0 20px 4px rgba(16, 185, 129, 0.08); }
}

@keyframes kbd-breathe {
  0%, 100% { opacity: 0.6; transform: translateY(-50%) scale(1); }
  50% { opacity: 1; transform: translateY(-50%) scale(1.05); }
}

@keyframes number-glow {
  0%, 100% { filter: brightness(1) drop-shadow(0 0 0 transparent); }
  50% { filter: brightness(1.15) drop-shadow(0 0 8px rgba(16, 185, 129, 0.2)); }
}

@keyframes save-flash {
  0% {
    background-color: rgba(16, 185, 129, 0.15);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.3);
  }
  50% {
    background-color: rgba(16, 185, 129, 0.08);
    box-shadow: 0 0 24px 4px rgba(16, 185, 129, 0.12);
  }
  100% {
    background-color: rgba(16, 185, 129, 0.04);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

@keyframes check-pop {
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes empty-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-6px) rotate(2deg); }
  75% { transform: translateY(3px) rotate(-1deg); }
}

@keyframes tip-glow {
  0%, 100% { border-color: rgba(16, 185, 129, 0.1); box-shadow: 0 0 0 0 transparent; }
  50% { border-color: rgba(16, 185, 129, 0.2); box-shadow: 0 0 20px -4px rgba(16, 185, 129, 0.06); }
}

@keyframes filter-slide-in {
  from {
    opacity: 0;
    transform: scaleX(0.7);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes toast-check {
  0% { transform: scale(0) rotate(-180deg); }
  60% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes ripple-out {
  to {
    transform: scale(2.5);
    opacity: 0;
  }
}

/* ═══════════════════════════════════════════
   UTILITY CLASSES
   ═══════════════════════════════════════════ */

.animate-rise {
  animation: rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.animate-stagger-rise {
  animation: stagger-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.animate-pop {
  animation: pop 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.animate-shake-spring {
  animation: shake-spring 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
.animate-gradient-flow {
  animation: gradient-flow 3s ease-in-out infinite;
}
.animate-badge-pulse {
  animation: badge-pulse 3s ease-in-out infinite;
}
.badge-pulse {
  animation: badge-pulse 3s ease-in-out infinite;
}
.icon-glow {
  animation: icon-glow 4s ease-in-out infinite;
}
.animate-icon-breathe {
  animation: icon-breathe 3s ease-in-out infinite;
}
.animate-kbd-breathe {
  animation: kbd-breathe 2.5s ease-in-out infinite;
}
.animate-number-glow {
  animation: number-glow 4s ease-in-out infinite;
}
.animate-save-flash {
  animation: save-flash 1.4s ease-out both;
}
.animate-check-pop {
  animation: check-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.animate-empty-float {
  animation: empty-float 5s ease-in-out infinite;
}
.animate-tip-glow {
  animation: rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both, tip-glow 5s ease-in-out 1s infinite;
}
.animate-toast-check {
  animation: toast-check 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

/* Ripple button */
.btn-ripple {
  position: relative;
  overflow: hidden;
}
.btn-ripple::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--ripple-x, 50%) var(--ripple-y, 50%), rgba(255,255,255,0.12) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s;
}
.btn-ripple:active::after {
  opacity: 1;
}

/* Stat cards hover glow */
.stat-card {
  position: relative;
}
.stat-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(135deg, transparent, rgba(255,255,255,0.04), transparent);
  opacity: 0;
  transition: opacity 0.5s;
}
.stat-card:hover::before {
  opacity: 1;
}

/* ─── Transitions ─── */
.fade-enter-active {
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
  filter: blur(4px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
  filter: blur(2px);
}

.toast-enter-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 0.35s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, 24px) scale(0.9);
  filter: blur(6px);
}
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px) scale(0.95);
  filter: blur(3px);
}

input[type='search']::-webkit-search-cancel-button {
  display: none;
}

/* ─── Reduced motion ─── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>