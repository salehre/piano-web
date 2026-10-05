<script setup lang="ts">
/** سؤال‌های متداول به‌صورت آکاردئونی؛ هر بار فقط یک مورد باز می‌مونه */
const openIndex = ref<number | null>(null)
const uid = useId()

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <section aria-labelledby="faq-title">
    <h2 id="faq-title" class="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
    <p class="mt-2 text-sm text-stone-400">Quick answers to the things people ask most.</p>

    <ul class="mt-6 flex flex-col gap-3">
      <li
        v-for="(item, i) in FAQ_ITEMS"
        :key="item.question"
        class="glass-card relative transition-shadow duration-300"
        :class="openIndex === i ? 'ring-1 ring-key-active/30' : ''"
      >
        <h3>
          <button
            :id="`${uid}-btn-${i}`"
            type="button"
            class="flex w-full items-center justify-between gap-4 rounded-[28px] px-6 py-4 text-left font-medium focus-visible:outline-2 focus-visible:outline-key-active"
            :aria-expanded="openIndex === i"
            :aria-controls="`${uid}-panel-${i}`"
            @click="toggle(i)"
          >
            <span>{{ item.question }}</span>
            <svg
              class="size-4 shrink-0 text-stone-400 transition-transform duration-300"
              :class="openIndex === i ? 'rotate-180 text-key-active' : ''"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m5 8 5 5 5-5" />
            </svg>
          </button>
        </h3>

        <!-- انیمیشن باز و بسته شدن با grid-template-rows -->
        <div
          :id="`${uid}-panel-${i}`"
          role="region"
          :aria-labelledby="`${uid}-btn-${i}`"
          class="grid transition-[grid-template-rows] duration-300 ease-out"
          :class="openIndex === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        >
          <div class="overflow-hidden">
            <p class="px-6 pb-5 text-sm leading-relaxed text-stone-300" :inert="openIndex !== i">
              {{ item.answer }}
            </p>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>