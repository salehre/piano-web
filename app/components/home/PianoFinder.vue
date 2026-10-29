<script setup lang="ts">
/** سؤال‌های مرحله‌ای و پیشنهاد اندازه‌ی پیانو؛ منطق انتخاب توی utils/Pianofinder.ts و متن‌ها توی i18n/locales/<زبان>/finder.json */
const { t, n } = useI18n()
const tr = useTr()

interface Option {
  value: string
  label: string
  hint?: string
  bars?: number
}
interface Step {
  key: 'goals' | 'level' | 'genres' | 'input' | 'instrument' | 'instrumentKeys'
  title: string
  subtitle?: string
  multi?: boolean
  options: readonly Option[]
  cols: string
  when?: () => boolean
}

const answers = reactive<{
  goals?: string[]
  level?: string
  genres?: string[]
  input?: string
  instrument?: string
  instrumentKeys?: string
}>({})

const allSteps = computed<Step[]>(() => [
  {
    key: 'goals',
    title: t('finder.steps.goals.title'),
    subtitle: t('finder.selectAll'),
    multi: true,
    options: FINDER_GOALS.map((g) => ({ value: g, label: t(`finder.goals.${g}`) })),
    cols: 'grid-cols-1 sm:grid-cols-3',
  },
  {
    key: 'level',
    title: t('finder.steps.level.title'),
    options: PIANO_LEVELS.map((l, i) => ({
      value: l,
      label: t(`finder.levels.${l}.label`),
      hint: t(`finder.levels.${l}.hint`),
      bars: i + 1,
    })),
    cols: 'grid-cols-1 sm:grid-cols-2',
  },
  {
    key: 'genres',
    title: t('finder.steps.genres.title'),
    subtitle: t('finder.selectAll'),
    multi: true,
    options: FAVORITE_GENRES.map((g) => ({ value: g, label: t(`finder.genres.${g}`) })),
    cols: 'grid-cols-2 sm:grid-cols-3',
  },
  {
    key: 'input',
    title: t('finder.steps.input.title'),
    subtitle: t('finder.steps.input.subtitle'),
    options: FINDER_INPUTS.map((v) => ({ value: v, label: t(`finder.inputs.${v}.label`), hint: t(`finder.inputs.${v}.hint`) })),
    cols: 'grid-cols-1 sm:grid-cols-2',
  },
  {
    key: 'instrument',
    title: t('finder.steps.instrument.title'),
    subtitle: t('finder.steps.instrument.subtitle'),
    options: FINDER_INSTRUMENTS.map((v) => ({ value: v, label: t(`finder.instruments.${v}.label`), hint: t(`finder.instruments.${v}.hint`) })),
    cols: 'grid-cols-1 sm:grid-cols-3',
  },
  {
    key: 'instrumentKeys',
    title: t('finder.steps.instrumentKeys.title'),
    options: [
      ...PIANO_TYPES.map((p) => ({ value: String(p.keys), label: t('finder.keysCount', { n: n(p.keys) }) })),
      { value: 'unsure', label: t('finder.unsure') },
    ],
    cols: 'grid-cols-2 sm:grid-cols-4',
    when: () => answers.instrument === 'digital',
  },
])

const visible = computed(() => allSteps.value.filter((s) => !s.when || s.when()))
const step = ref(0)
const direction = ref(1) // 1 رفت، -1 برگشت
const transitionName = computed(() => (direction.value >= 0 ? 'step-next' : 'step-prev'))
const heading = ref<HTMLElement>()
let advanceTimer: ReturnType<typeof setTimeout> | undefined

const current = computed(() => visible.value[step.value])
const selected = (s: Step, value: string) => {
  const a = answers[s.key]
  return Array.isArray(a) ? a.includes(value) : a === value
}
const canContinue = computed(() => {
  const s = current.value
  if (!s?.multi) return true
  return ((answers[s.key] as string[] | undefined)?.length ?? 0) > 0
})

const result = computed(() => {
  if (step.value < visible.value.length) return null
  const keys =
    answers.instrument === 'digital' && answers.instrumentKeys && answers.instrumentKeys !== 'unsure'
      ? Number(answers.instrumentKeys)
      : undefined
  return recommendPiano({
    goals: (answers.goals ?? []) as GoalId[],
    level: answers.level as PianoLevel,
    genres: answers.genres ?? [],
    input: answers.input as FinderInput,
    instrument: (answers.instrument ?? 'none') as FinderInstrument,
    instrumentKeys: keys,
  })
})

async function go(to: number) {
  if (to === step.value) return
  clearTimeout(advanceTimer)
  direction.value = to > step.value ? 1 : -1
  step.value = to
  await nextTick()
  heading.value?.focus()
}

function choose(value: string) {
  const s = current.value
  if (!s) return
  if (s.multi) {
    const list = (answers[s.key] as string[] | undefined) ?? []
    ;(answers as Record<string, unknown>)[s.key] = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value]
    return
  }
  ;(answers as Record<string, unknown>)[s.key] = value
  // مکث کوتاه تا پالس انتخاب دیده بشه
  clearTimeout(advanceTimer)
  direction.value = 1
  advanceTimer = setTimeout(() => go(step.value + 1), 200)
}

function restart() {
  clearTimeout(advanceTimer)
  for (const k of Object.keys(answers)) delete (answers as Record<string, unknown>)[k]
  direction.value = -1
  go(0)
}
</script>

<template>
  <section
    class="piano-finder finder-bg group/finder relative isolate overflow-hidden rounded-3xl border border-key-active/10 bg-stone-950/85 p-6 shadow-2xl backdrop-blur-2xl sm:p-10"
    aria-labelledby="finder-title"
  >
    <img
      src="/images/piano-finder-bg.webp"
      alt=""
      aria-hidden="true"
      class="bg-zoom absolute inset-0 -z-10 size-full object-cover object-center opacity-45 mix-blend-luminosity"
    />
    <div class="orb orb-1 pointer-events-none absolute -top-32 -inset-e-32 -z-10 size-80 rounded-full bg-key-active/15 blur-[100px]" aria-hidden="true" />
    <div class="orb orb-2 pointer-events-none absolute -bottom-32 -inset-s-32 -z-10 size-80 rounded-full bg-key-active/10 blur-[100px]" aria-hidden="true" />
    <div class="absolute inset-0 -z-10 bg-linear-to-b from-stone-950/50 via-stone-950/60 to-stone-950/75" aria-hidden="true" />

    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="title-in">
        <div class="inline-flex items-center gap-2 rounded-full border border-key-active/20 bg-key-active/10 px-3 py-1 text-xs font-medium text-key-active backdrop-blur-md">
          <span class="equalizer flex items-end gap-0.5" aria-hidden="true">
            <span /><span /><span /><span />
          </span>
          {{ t('finder.title') }}
        </div>
        <p class="mt-2 text-sm text-stone-400">{{ t('finder.intro') }}</p>
      </div>
      <div v-if="current" class="flex items-center gap-1.5 self-start text-xs font-mono font-medium text-stone-400 sm:self-auto">
        <span :key="step" class="num-swap rounded-md bg-stone-800/80 px-2 py-1 text-stone-200">{{ n(step + 1) }}</span>
        <span>/</span>
        <span>{{ n(visible.length) }}</span>
      </div>
    </header>

    <!-- پروگرس‌بار -->
    <div
      class="mt-6 flex gap-1.5"
      role="progressbar"
      :aria-valuemin="0"
      :aria-valuemax="visible.length"
      :aria-valuenow="Math.min(step, visible.length)"
    >
      <button
        v-for="(s, i) in visible"
        :key="s.key"
        type="button"
        :disabled="i >= step"
        :aria-label="s.title"
        class="progress-seg relative h-1.5 flex-1 overflow-hidden rounded-full transition-all duration-500 ease-out"
        :class="[
          i < step ? 'progress-complete bg-key-active cursor-pointer hover:brightness-110'
          : i === step ? 'bg-key-active/70 scale-y-110 cursor-default'
          : 'bg-stone-800/60 cursor-default'
        ]"
        @click="i < step && go(i)"
      >
        <span v-if="i === step" class="shimmer absolute inset-0" aria-hidden="true" />
      </button>
    </div>

    <Transition :name="transitionName" mode="out-in">
      <div v-if="current" :key="current.key" class="mt-8">
        <div class="min-h-14">
          <h3 ref="heading" tabindex="-1" class="title-in text-xl font-bold tracking-tight text-stone-100 outline-none sm:text-2xl">
            {{ current.title }}
          </h3>
          <p v-if="current.subtitle" class="subtitle-in mt-1 text-sm text-stone-400/90">{{ current.subtitle }}</p>
        </div>

        <div class="mt-6 grid gap-3.5" :class="current.cols" :role="current.multi ? 'group' : 'radiogroup'" :aria-label="current.title">
          <button
            v-for="(o, idx) in current.options"
            :key="o.value"
            type="button"
            :role="current.multi ? 'checkbox' : 'radio'"
            :aria-checked="selected(current, o.value)"
            :style="{ '--i': idx } as any"
            class="opt-btn opt-enter group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 text-start backdrop-blur-md select-none"
            :class="selected(current, o.value) ? 'is-selected border-key-active bg-key-active/15 text-stone-100 ring-1 ring-key-active/50' : 'border-stone-800/80 bg-stone-900/40 text-stone-300 hover:border-stone-600 hover:bg-stone-800/50 hover:text-stone-100'"
            @click="choose(o.value)"
          >
            <div class="relative z-1 flex w-full items-center justify-between gap-2">
              <span v-if="o.bars" class="bars flex items-end gap-1" aria-hidden="true">
                <span
                  v-for="b in 6"
                  :key="b"
                  class="bar w-1.5 rounded-full"
                  :style="{ '--b': b, height: `${6 + b * 3}px` } as any"
                  :class="b <= (o.bars ?? 0) ? (selected(current, o.value) ? 'bar-active bg-key-active' : 'bg-stone-400') : 'bg-stone-800'"
                />
              </span>
              <div
                class="check ms-auto flex size-5 items-center justify-center rounded-full border"
                :class="selected(current, o.value) ? 'border-key-active bg-key-active text-stone-950' : 'border-stone-700 bg-stone-800/40 group-hover:border-stone-500'"
              >
                <svg v-if="selected(current, o.value)" class="check-icon size-3.5 stroke-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div class="relative z-1 mt-3">
              <span class="block font-medium text-stone-100 transition-colors group-hover:text-key-active">{{ o.label }}</span>
              <span v-if="o.hint" class="mt-1 block text-xs leading-relaxed text-stone-400">{{ o.hint }}</span>
            </div>
          </button>
        </div>

        <div class="mt-8 flex items-center justify-between border-t border-stone-800/60 pt-5">
          <button
            v-if="step > 0"
            type="button"
            class="group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-400 transition-all duration-200 hover:bg-stone-900 hover:text-stone-200 active:scale-95"
            @click="go(step - 1)"
          >
            <svg class="size-4 transition-transform duration-300 group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {{ t('finder.back') }}
          </button>
          <div v-else class="flex-1" />
          <button
            v-if="current.multi"
            type="button"
            class="cta-primary inline-flex items-center gap-2 rounded-xl bg-key-active px-6 py-2.5 text-sm font-semibold text-stone-950 disabled:pointer-events-none disabled:opacity-40"
            :disabled="!canContinue"
            @click="go(step + 1)"
          >
            {{ t('finder.continue') }}
            <svg class="size-4 transition-transform duration-300 group-hover/finder:translate-x-0.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      <div v-else-if="result" key="result" class="result-wrap mt-8">
        <div class="result-card relative overflow-hidden rounded-3xl border border-key-active/30 bg-linear-to-br from-stone-900/90 via-stone-950 to-stone-900/60 p-6 backdrop-blur-xl sm:p-8">
          <div class="pointer-events-none absolute -top-12 -inset-e-12 size-40 rounded-full bg-key-active/10 blur-2xl" />
          <span class="inline-block text-xs font-semibold tracking-wider uppercase text-key-active">{{ t('finder.result.weRecommend') }}</span>
          <div class="mt-2 flex flex-wrap items-baseline gap-3">
            <h3 ref="heading" tabindex="-1" class="text-3xl font-extrabold text-stone-100 outline-none sm:text-4xl">
              {{ t('finder.keysCount', { n: n(result.type.keys) }) }}
            </h3>
            <span dir="ltr" class="inline-flex items-center rounded-lg border border-stone-700/80 bg-stone-800/60 px-2.5 py-1 text-xs font-mono font-medium text-stone-300">
              {{ result.type.from }} – {{ result.type.to }}
            </span>
          </div>
          <p class="mt-3 text-sm leading-relaxed text-stone-300 sm:text-base">{{ t(`finder.sizeNotes.s${result.type.keys}`) }}</p>

          <div class="mt-6 border-t border-stone-800/80 pt-4">
            <ul class="space-y-2.5 text-sm text-stone-300">
              <li v-for="(r, i) in result.reasons" :key="i" :style="{ '--i': i } as any" class="reason flex items-start gap-2.5">
                <svg class="mt-0.5 size-4 shrink-0 text-key-active" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ tr(r) }}</span>
              </li>
            </ul>
          </div>

          <div v-if="result.tips.length" class="tips-in mt-6 rounded-2xl border border-stone-800 bg-stone-900/60 p-4 backdrop-blur-sm">
            <div class="flex items-center gap-2 font-medium text-stone-200">
              <svg class="size-4.5 text-key-active" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 class="text-sm font-semibold">{{ t('finder.result.goodToKnow') }}</h4>
            </div>
            <ul class="mt-2.5 space-y-1.5 ps-6 text-xs leading-relaxed text-stone-400">
              <li v-for="(tip, i) in result.tips" :key="i" class="list-disc">
                {{ tr(tip.text) }}
                <NuxtLink v-if="tip.link" :to="tip.link.to" class="font-medium text-key-active underline underline-offset-4 hover:opacity-80">{{ tr(tip.link.label) }}</NuxtLink>
              </li>
            </ul>
          </div>

          <i18n-t v-if="result.ideal" keypath="finder.result.alsoPoints" tag="p" class="mt-5 text-xs text-stone-400">
            <template #keys><strong class="font-semibold text-stone-200">{{ n(result.ideal.keys) }}</strong></template>
            <template #link>
              <NuxtLink :to="{ path: '/virtual-piano', query: { keys: result.ideal.keys } }" class="font-medium text-key-active underline-offset-4 hover:underline">{{ t('finder.result.trySize') }}</NuxtLink>
            </template>
          </i18n-t>
        </div>

        <div class="result-actions mt-6 flex flex-wrap items-center gap-3">
          <NuxtLink :to="{ path: '/virtual-piano', query: { keys: result.type.keys } }" class="cta-primary inline-flex items-center gap-2 rounded-xl bg-key-active px-6 py-3.5 text-sm font-bold text-stone-950">
            <svg class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ t('finder.result.play', { n: n(result.type.keys) }) }}
          </NuxtLink>
          <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/50 px-5 py-3.5 text-sm font-medium text-stone-300 transition-all duration-200 hover:bg-stone-800 hover:text-stone-100 active:scale-95" @click="restart">
            <svg class="size-4 transition-transform duration-500 hover:-rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ t('finder.startOver') }}
          </button>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
/* ---------- easing مشترک ---------- */
.piano-finder {
  --ease-spring: cubic-bezier(0.22, 1, 0.36, 1);
}

/* ---------- بک‌گراند زنده ---------- */
.bg-zoom { animation: slow-zoom 26s ease-in-out infinite alternate; will-change: transform; }
@keyframes slow-zoom {
  from { transform: scale(1) translateY(0); }
  to { transform: scale(1.08) translateY(-1.5%); }
}
.orb-1 { animation: drift-1 9s ease-in-out infinite alternate; }
.orb-2 { animation: drift-2 11s ease-in-out infinite alternate; }
@keyframes drift-1 { from { transform: translate(0,0) scale(1); opacity:.8; } to { transform: translate(-30px,30px) scale(1.15); opacity:1; } }
@keyframes drift-2 { from { transform: translate(0,0) scale(1); opacity:.7; } to { transform: translate(30px,-25px) scale(1.1); opacity:1; } }

/* اکولایزر هدر */
.equalizer span {
  width: 3px; border-radius: 999px; background: currentColor;
  animation: eq 1.1s ease-in-out infinite;
}
.equalizer span:nth-child(1){ height: 8px; animation-delay: 0s; }
.equalizer span:nth-child(2){ height: 12px; animation-delay: .15s; }
.equalizer span:nth-child(3){ height: 6px; animation-delay: .3s; }
.equalizer span:nth-child(4){ height: 10px; animation-delay: .45s; }
@keyframes eq { 0%,100% { transform: scaleY(.6); opacity:.6; } 50% { transform: scaleY(1.2); opacity:1; } }

/* ---------- ترنزیشن مرحله (جهت‌دار) ---------- */
.step-next-enter-active, .step-next-leave-active,
.step-prev-enter-active, .step-prev-leave-active {
  transition: opacity .28s ease, transform .38s var(--ease-spring), filter .28s ease;
  will-change: transform, opacity, filter;
}
.step-next-enter-from { opacity: 0; transform: translateY(20px) scale(.985); filter: blur(8px); }
.step-next-leave-to { opacity: 0; transform: translateY(-18px) scale(.985); filter: blur(8px); }
.step-prev-enter-from { opacity: 0; transform: translateY(-20px) scale(.985); filter: blur(8px); }
.step-prev-leave-to { opacity: 0; transform: translateY(18px) scale(.985); filter: blur(8px); }

/* ---------- ورود پلکانی ---------- */
.title-in { animation: rise-in .5s var(--ease-spring) both; }
.subtitle-in { animation: rise-in .5s var(--ease-spring) both; animation-delay: 60ms; }
@keyframes rise-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

.num-swap { display: inline-block; animation: num-in .35s var(--ease-spring) both; }
@keyframes num-in { from { opacity: 0; transform: translateY(8px) scale(.9); } to { opacity: 1; transform: none; } }

.opt-enter {
  animation: card-in .55s var(--ease-spring) both;
  animation-delay: calc(var(--i, 0) * 60ms + 90ms);
  transition: transform .22s var(--ease-spring), border-color .22s, background-color .22s, box-shadow .25s, color .22s;
  will-change: transform;
}
.opt-enter:hover { transform: translateY(-3px); }
.opt-enter:active { transform: translateY(0) scale(.98); }
@keyframes card-in {
  from { opacity: 0; transform: translateY(16px) scale(.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* برق کشویی روی hover */
.opt-btn::before {
  content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: linear-gradient(105deg, transparent 42%, rgba(255,255,255,.09) 50%, transparent 58%);
  transform: translateX(-130%);
  transition: transform .7s ease;
}
.opt-btn:hover::before { transform: translateX(130%); }

/* پالس انتخاب */
.is-selected {
  animation: select-pulse .5s ease-out;
  box-shadow: 0 0 24px -6px color-mix(in srgb, var(--color-key-active) 32%, transparent);
}
@keyframes select-pulse {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-key-active) 50%, transparent); }
  100% { box-shadow: 0 0 0 14px transparent; }
}
.check { transition: all .25s var(--ease-spring); }
.check-icon { animation: pop .35s var(--ease-spring) both; transform-origin: center; }
@keyframes pop { 0% { transform: scale(.4); } 60% { transform: scale(1.25); } 100% { transform: scale(1); } }

/* نوارهای سطح */
.bar {
  transform-origin: bottom;
  animation: bar-grow .6s var(--ease-spring) both;
  animation-delay: calc(var(--b, 1) * 45ms + 200ms);
  transition: background-color .25s, box-shadow .25s;
}
.bar-active { box-shadow: 0 0 6px color-mix(in srgb, var(--color-key-active) 60%, transparent); }
@keyframes bar-grow { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }

/* پروگرس shimmer */
.progress-seg:disabled { cursor: default; }
.progress-complete { box-shadow: 0 0 10px color-mix(in srgb, var(--color-key-active) 50%, transparent); }
.shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
  transform: translateX(-100%);
  animation: shimmer-slide 1.8s ease-in-out infinite;
}
@keyframes shimmer-slide { 60%,100% { transform: translateX(100%); } }

/* CTA درخشان */
.cta-primary {
  position: relative; overflow: hidden;
  box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--color-key-active) 45%, transparent);
  transition: transform .2s var(--ease-spring), filter .2s, box-shadow .25s;
  animation: cta-glow 3s ease-in-out infinite;
}
.cta-primary:hover { transform: translateY(-2px) scale(1.02); filter: brightness(1.05); }
.cta-primary:active { transform: scale(.97); }
.cta-primary::after {
  content:""; position:absolute; inset:0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.35) 50%, transparent 60%);
  transform: translateX(-130%);
  animation: cta-shine 3.2s ease-in-out infinite;
}
@keyframes cta-glow {
  0%,100% { box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--color-key-active) 35%, transparent); }
  50% { box-shadow: 0 8px 32px -6px color-mix(in srgb, var(--color-key-active) 60%, transparent); }
}
@keyframes cta-shine { 0%,55% { transform: translateX(-130%); } 90%,100% { transform: translateX(130%); } }

/* ---------- نتیجه ---------- */
.result-card { animation: result-in .7s var(--ease-spring) both; transform-origin: top center; }
@keyframes result-in {
  from { opacity: 0; transform: translateY(24px) scale(.96); filter: blur(10px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
.reason {
  animation: card-in .5s var(--ease-spring) both;
  animation-delay: calc(var(--i, 0) * 80ms + 250ms);
}
.tips-in { animation: card-in .6s var(--ease-spring) both; animation-delay: 380ms; }
.result-actions { animation: card-in .6s var(--ease-spring) both; animation-delay: 450ms; }

/* ---------- احترام به reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .bg-zoom, .orb-1, .orb-2, .shimmer, .cta-primary, .cta-primary::after, .equalizer span {
    animation: none !important;
  }
}
</style>