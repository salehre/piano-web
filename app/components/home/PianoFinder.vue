<script setup lang="ts">
/** سؤال‌های مرحله‌ای و پیشنهاد اندازه‌ی پیانو؛ منطق انتخاب توی utils/Pianofinder.ts و متن‌ها توی i18n/locales/<زبان>/finder.json */
const { t, n } = useI18n()
const tr = useTr()

interface Option {
  value: string
  label: string
  hint?: string
  bars?: number // تعداد نوار پر برای نمایش سطح
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

// computed است تا با عوض شدن زبان، سؤال‌ها و گزینه‌ها همون لحظه ترجمه بشن
const allSteps = computed<Step[]>(() => [
  {
    key: 'goals',
    title: t('finder.steps.goals.title'),
    subtitle: t('finder.selectAll'),
    multi: true,
    options: FINDER_GOALS.map((g) => ({ value: g, label: t(`finder.goals.${g}`) })),
    cols: 'sm:grid-cols-3',
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
    cols: 'sm:grid-cols-2',
  },
  {
    key: 'genres',
    title: t('finder.steps.genres.title'),
    subtitle: t('finder.selectAll'),
    multi: true,
    options: FAVORITE_GENRES.map((g) => ({ value: g, label: t(`finder.genres.${g}`) })),
    cols: 'sm:grid-cols-3',
  },
  {
    key: 'input',
    title: t('finder.steps.input.title'),
    subtitle: t('finder.steps.input.subtitle'),
    options: FINDER_INPUTS.map((v) => ({ value: v, label: t(`finder.inputs.${v}.label`), hint: t(`finder.inputs.${v}.hint`) })),
    cols: 'sm:grid-cols-2',
  },
  {
    key: 'instrument',
    title: t('finder.steps.instrument.title'),
    subtitle: t('finder.steps.instrument.subtitle'),
    options: FINDER_INSTRUMENTS.map((v) => ({ value: v, label: t(`finder.instruments.${v}.label`), hint: t(`finder.instruments.${v}.hint`) })),
    cols: 'sm:grid-cols-3',
  },
  {
    key: 'instrumentKeys',
    title: t('finder.steps.instrumentKeys.title'),
    options: [
      ...PIANO_TYPES.map((p) => ({ value: String(p.keys), label: t('finder.keysCount', { n: n(p.keys) }) })),
      { value: 'unsure', label: t('finder.unsure') },
    ],
    cols: 'sm:grid-cols-4',
    when: () => answers.instrument === 'digital',
  },
])

const visible = computed(() => allSteps.value.filter((s) => !s.when || s.when()))
const step = ref(0) // برابر visible.length یعنی نتیجه
const heading = ref<HTMLElement>()

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
  const keys = answers.instrument === 'digital' && answers.instrumentKeys && answers.instrumentKeys !== 'unsure'
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
  step.value = to
  await nextTick()
  heading.value?.focus() // صفحه‌خوان‌ها سؤال تازه رو بخونن
}

function choose(value: string) {
  const s = current.value
  if (!s) return
  if (s.multi) {
    const list = (answers[s.key] as string[] | undefined) ?? []
    ;(answers as Record<string, unknown>)[s.key] = list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    return
  }
  ;(answers as Record<string, unknown>)[s.key] = value
  go(step.value + 1)
}

function restart() {
  for (const k of Object.keys(answers)) delete (answers as Record<string, unknown>)[k]
  go(0)
}
</script>

<template>
  <section class="relative isolate overflow-hidden rounded-2xl bg-stone-950 p-6 sm:p-8" aria-labelledby="finder-title">
    <!-- تصویر پس‌زمینه + لایه‌ی تیره برای خوانایی متن -->
    <img
        src="/images/piano-finder-bg.webp"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 -z-20 size-full object-cover object-center"
    />
    <div class="absolute inset-0 -z-10 bg-gradient-to-r from-stone-950/90 via-stone-950/80 to-stone-950/65" aria-hidden="true" />

    <h2 id="finder-title" class="text-xl font-semibold">{{ t('finder.title') }}</h2>
    <p class="mt-1 text-sm text-stone-400">{{ t('finder.intro') }}</p>

    <!-- نوار پیشرفت -->
    <div
        class="mt-5 flex gap-2"
        role="progressbar"
        aria-valuemin="0"
        :aria-valuemax="visible.length"
        :aria-valuenow="Math.min(step, visible.length)"
    >
      <div
          v-for="(s, i) in visible"
          :key="s.key"
          class="h-1.5 flex-1 rounded-full transition-colors"
          :class="i < step ? 'bg-key-active' : i === step ? 'bg-key-active/50' : 'bg-stone-800'"
      />
    </div>

    <!-- سؤال -->
    <div v-if="current" class="mt-6">
      <p class="text-xs uppercase tracking-wide text-stone-400">{{ t('finder.questionOf', { current: n(step + 1), total: n(visible.length) }) }}</p>
      <h3 ref="heading" tabindex="-1" class="mt-1 text-lg font-medium outline-none">{{ current.title }}</h3>
      <p v-if="current.subtitle" class="mt-0.5 text-sm text-stone-400">{{ current.subtitle }}</p>

      <!-- گزینه‌ها: توی موبایل دوتا دوتا کنار هم، از sm به بالا طبق cols هر سؤال -->
      <div class="mt-4 grid grid-cols-2 gap-3" :class="current.cols" :role="current.multi ? 'group' : 'radiogroup'" :aria-label="current.title">
        <button
            v-for="o in current.options"
            :key="o.value"
            type="button"
            :role="current.multi ? 'checkbox' : 'radio'"
            :aria-checked="selected(current, o.value)"
            class="rounded-xl border px-4 py-3 text-start transition-all hover:bg-key-active/10 hover:text-key-active hover:shadow-[0_0_16px_-4px_rgba(245,230,200,0.35)]"
            :class="selected(current, o.value) ? 'border-key-active bg-key-active/10 text-key-active' : 'border-stone-700 bg-stone-950/50'"
            @click="choose(o.value)"
        >
          <!-- نوارهای سطح -->
          <span v-if="o.bars" class="mb-2 flex items-end gap-0.5" aria-hidden="true">
            <span
                v-for="n in 6"
                :key="n"
                class="w-1.5 rounded-sm"
                :class="n <= o.bars ? 'bg-key-active' : 'bg-stone-700'"
                :style="{ height: `${6 + n * 3}px` }"
            />
          </span>
          <span class="block font-medium">{{ o.label }}</span>
          <span v-if="o.hint" class="mt-0.5 block text-xs text-stone-400">{{ o.hint }}</span>
        </button>
      </div>

      <div class="mt-4 flex items-center gap-4">
        <button v-if="step > 0" type="button" class="text-sm text-stone-400 hover:text-key-active" @click="go(step - 1)">
          <span class="inline-block rtl:rotate-180" aria-hidden="true">←</span>
          {{ t('finder.back') }}
        </button>
        <button
            v-if="current.multi"
            type="button"
            class="rounded-lg bg-key-active px-5 py-2.5 font-medium text-stone-950 transition-opacity hover:opacity-90 disabled:opacity-40"
            :disabled="!canContinue"
            @click="go(step + 1)"
        >
          {{ t('finder.continue') }}
        </button>
      </div>
    </div>

    <!-- نتیجه -->
    <div v-else-if="result" class="mt-6">
      <p class="text-xs uppercase tracking-wide text-stone-400">{{ t('finder.result.weRecommend') }}</p>
      <h3 ref="heading" tabindex="-1" class="mt-1 text-3xl font-semibold outline-none">
        {{ t('finder.keysCount', { n: n(result.type.keys) }) }}
        <span dir="ltr" class="ms-1 inline-block text-base font-normal text-stone-400">{{ result.type.from }} – {{ result.type.to }}</span>
      </h3>
      <p class="mt-2 text-stone-300">{{ t(`finder.sizeNotes.s${result.type.keys}`) }}</p>

      <ul class="mt-4 list-disc space-y-1 ps-5 text-sm text-stone-400">
        <li v-for="(r, i) in result.reasons" :key="i">{{ tr(r) }}</li>
      </ul>

      <div v-if="result.tips.length" class="mt-5 rounded-xl bg-stone-900/70 p-4">
        <h4 class="text-sm font-medium">{{ t('finder.result.goodToKnow') }}</h4>
        <ul class="mt-2 space-y-1.5 text-sm text-stone-300">
          <li v-for="(tip, i) in result.tips" :key="i">
            {{ tr(tip.text) }}
            <NuxtLink v-if="tip.link" :to="tip.link.to" class="text-key-active underline-offset-2 hover:underline">{{ tr(tip.link.label) }}</NuxtLink>
          </li>
        </ul>
      </div>

      <i18n-t v-if="result.ideal" keypath="finder.result.alsoPoints" tag="p" class="mt-4 text-sm text-stone-400">
        <template #keys>{{ n(result.ideal.keys) }}</template>
        <template #link>
          <NuxtLink
              :to="{ path: '/virtual-piano', query: { keys: result.ideal.keys } }"
              class="text-key-active underline-offset-2 hover:underline"
          >
            {{ t('finder.result.trySize') }}
          </NuxtLink>
        </template>
      </i18n-t>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <NuxtLink
            :to="{ path: '/virtual-piano', query: { keys: result.type.keys } }"
            class="rounded-lg bg-key-active px-5 py-3 font-medium text-stone-950 transition-opacity hover:opacity-90"
        >
          {{ t('finder.result.play', { n: n(result.type.keys) }) }}
        </NuxtLink>
        <button type="button" class="rounded-lg px-4 py-3 text-sm text-stone-300 hover:text-key-active" @click="restart">
          {{ t('finder.startOver') }}
        </button>
      </div>
    </div>
  </section>
</template>