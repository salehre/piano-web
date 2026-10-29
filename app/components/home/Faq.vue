<script setup lang="ts">
/** سؤال‌های متداول به‌صورت آکاردئونی؛ هر بار فقط یک مورد باز می‌مونه */
const { t } = useI18n()
const openIndex = ref<number | null>(null)
const uid = useId()

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <section aria-labelledby="faq-title">
    <!-- ─── هدر ─── -->
    <header class="max-w-xl">
      <span class="inline-flex items-center gap-2 rounded-full border border-key-active/25 bg-key-active/10 px-3.5 py-1 text-xs font-medium text-key-active">
        <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        {{ t('faq.badge') }}
      </span>

      <h2 id="faq-title" class="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
        {{ t('faq.title') }}
      </h2>
      <p class="mt-2 text-sm leading-relaxed text-stone-400">
        {{ t('faq.subtitle') }}
      </p>
    </header>

    <!-- ─── آکاردئون ─── -->
    <ul class="mt-8 flex flex-col gap-2.5">
      <li
        v-for="(id, i) in FAQ_IDS"
        :key="id"
        class="glass-card faq-item group relative rounded-[28px] transition-all duration-300 hover:bg-white/3"
        :class="openIndex === i ? 'ring-1 ring-key-active/30 shadow-lg shadow-key-active/10' : ''"
        :style="{ animationDelay: `${i * 70}ms` }"
      >
        <!-- خط نوری بالای کارتِ باز -->
        <span
          aria-hidden="true"
          class="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-key-active/60 to-transparent transition-opacity duration-500"
          :class="openIndex === i ? 'opacity-100' : 'opacity-0'"
        />

        <h3>
          <button
            :id="`${uid}-btn-${i}`"
            type="button"
            class="flex w-full items-center gap-4 rounded-[28px] px-6 py-5 text-start font-medium focus-visible:outline-2 focus-visible:outline-key-active"
            :aria-expanded="openIndex === i"
            :aria-controls="`${uid}-panel-${i}`"
            @click="toggle(i)"
          >
            <!-- ─── آیکون مینی‌کیبورد پیانو ─── -->
            <svg
              viewBox="0 0 24 28"
              class="h-7 w-6 shrink-0 transition-colors duration-300"
              :class="openIndex === i ? 'text-key-active' : 'text-stone-500 group-hover:text-stone-300'"
              aria-hidden="true"
            >
              <!-- ۳ کلید سفید -->
              <rect x="1"    y="1" width="7.33" height="26" rx="1"
                    stroke="currentColor" fill="currentColor" stroke-width="1.2"
                    :fill-opacity="openIndex === i ? 0.28 : 0.12" />
              <rect x="8.33" y="1" width="7.34" height="26" rx="1"
                    stroke="currentColor" fill="currentColor" stroke-width="1.2"
                    :fill-opacity="openIndex === i ? 0.28 : 0.12" />
              <rect x="15.67" y="1" width="7.33" height="26" rx="1"
                    stroke="currentColor" fill="currentColor" stroke-width="1.2"
                    :fill-opacity="openIndex === i ? 0.28 : 0.12" />
              <!-- ۲ کلید سیاه -->
              <rect x="6.33"  y="1" width="4" height="15" rx="0.8"
                    fill="currentColor"
                    :fill-opacity="openIndex === i ? 0.95 : 0.85" />
              <rect x="13.67" y="1" width="4" height="15" rx="0.8"
                    fill="currentColor"
                    :fill-opacity="openIndex === i ? 0.95 : 0.85" />
            </svg>

            <!-- متن سؤال -->
            <span
              class="flex-1 transition-colors duration-300"
              :class="openIndex === i ? 'text-white' : 'text-stone-200 group-hover:text-white'"
            >
              {{ t(`faq.items.${id}.question`) }}
            </span>

            <!-- آیکون chevron داخل دایره -->
            <span
              class="grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-300"
              :class="openIndex === i
                ? 'rotate-180 border-key-active/40 bg-key-active/10 text-key-active'
                : 'border-stone-700/70 text-stone-400 group-hover:border-key-active/30 group-hover:text-key-active'"
            >
              <svg
                class="size-4"
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
            </span>
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
            <div class="relative px-6 pb-6">
              <!-- خط عمودی از زیر کیبورد تا پاسخ -->
              <span
                aria-hidden="true"
                class="absolute bottom-5 top-0 inset-s-9 w-px bg-linear-to-b from-key-active/60 via-key-active/20 to-transparent"
              />
              <p
                class="ps-10 text-sm leading-7 text-stone-300"
                :inert="openIndex !== i"
              >
                {{ t(`faq.items.${id}.answer`) }}
              </p>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
@keyframes faq-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}

.faq-item {
  animation: faq-enter 0.5s ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .faq-item {
    animation: none;
  }
}
</style>