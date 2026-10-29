<script setup lang="ts">
const { t, n } = useI18n()
const STORAGE_KEY = 'web-piano-club-emails'

const socials = [
  {
    name: 'Gmail',
    href: 'mailto:salehrezaeipoor123@gmail.com',
    color: 'rgba(234, 67, 53, 0.45)',
    icon: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  },
  {
    name: 'Telegram',
    href: 'https://t.me/cringebutfun',
    color: 'rgba(38, 165, 228, 0.45)',
    icon: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/>',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/salehre',
    color: 'rgba(240, 246, 252, 0.35)',
    icon: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 15 3.48a13.38 13.38 0 0 0-7 0C4.27.65 3.09 1 3.09 1A5.07 5.07 0 0 0 3 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 7 18.13V22"/>',
  },
  {
    name: 'Reddit',
    href: 'https://www.reddit.com/user/salehrezaei/',
    color: 'rgba(255, 69, 0, 0.45)',
    icon: '<path d="M12 8c-4.4 0-8 2-8 5.5S7.6 20 12 20s8-3 8-6.5S16.4 8 12 8Z"/><path d="m12 8 1-4 3 1M4 12l-1.5-1M20 12l1.5-1M9 13h.01M15 13h.01M9 16c1.8 1.4 4.2 1.4 6 0"/><circle cx="17" cy="5" r="1"/>',
  },
]

const links = [
  { label: 'nav.home', to: '/' },
  { label: 'nav.virtualPiano', to: '/virtual-piano' },
  { label: 'nav.blog', to: '/blog' },
  { label: 'nav.settings', to: '/settings' },
]

const year = n(new Date().getFullYear(), 'plain')

// ---------- عضویت در باشگاه ----------
const email = ref('')
const error = ref(false)
const joined = ref(false)
const submitting = ref(false)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

watch(email, () => {
  error.value = false
})

async function saveEmail(value: string) {
  try {
    const list: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!list.includes(value)) list.push(value)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // localStorage در دسترس نیست
  }
}

async function join() {
  if (submitting.value) return
  const value = email.value.trim().toLowerCase()
  if (!EMAIL_RE.test(value)) {
    error.value = true
    return
  }
  submitting.value = true
  await saveEmail(value)
  submitting.value = false
  joined.value = true
  email.value = ''
}

// کلاویه‌های دکوراتیو بالای فوتر
const pianoKeys = [
  { isBlack: false },
  { isBlack: true },
  { isBlack: false },
  { isBlack: true },
  { isBlack: false },
  { isBlack: false },
  { isBlack: true },
  { isBlack: false },
  { isBlack: true },
  { isBlack: false },
  { isBlack: true },
  { isBlack: false },
  { isBlack: false },
  { isBlack: true },
  { isBlack: false },
  { isBlack: true },
  { isBlack: false },
]
</script>

<template>
  <footer class="relative border-t border-white/5 bg-stone-950 overflow-hidden text-stone-200">
    <!-- نت‌های معلق در پس‌زمینه (Floating Musical Notes) -->
    <div class="music-ambient pointer-events-none absolute inset-0 overflow-hidden opacity-25">
      <span class="music-note note-1">♪</span>
      <span class="music-note note-2">♫</span>
      <span class="music-note note-3">𝄞</span>
      <span class="music-note note-4">♩</span>
      <span class="music-note note-5">♬</span>
      <span class="music-note note-6">♪</span>
    </div>

    <div class="relative mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.4fr)]">
      
      <!-- برند و شبکه‌های اجتماعی -->
      <div class="min-w-0">
        <div class="flex items-center gap-2.5">
          <NuxtLink to="/" class="group relative inline-flex items-center gap-2 text-lg font-semibold tracking-wide text-stone-100">
            <span class="transition-colors duration-300 group-hover:text-key-active">{{ t('app.name') }}</span>
          </NuxtLink>

          <!-- مینی اکولایزر ریتمیک موزیک -->
          <div class="equalizer flex items-end gap-0.5 h-3.5" title="Harmonic Resonance">
            <span class="eq-bar bar-1"></span>
            <span class="eq-bar bar-2"></span>
            <span class="eq-bar bar-3"></span>
            <span class="eq-bar bar-4"></span>
          </div>
        </div>

        <p class="mt-2.5 max-w-xs text-sm text-stone-400 leading-relaxed">
          {{ t('footer.description') }}
        </p>

        <!-- شبکه‌های اجتماعی با افکت رزونانس صوتی -->
        <ul class="mt-5 flex items-center gap-3" :aria-label="t('footer.social')">
          <li v-for="s in socials" :key="s.name">
            <a
              :href="s.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="s.name"
              :title="s.name"
              :style="{ '--social-color': s.color }"
              class="social-btn group relative flex size-10 items-center justify-center rounded-full border border-white/10 bg-stone-900/60 text-stone-300 transition-all duration-300 hover:border-transparent hover:text-key-active"
            >
              <!-- امواج صوتی که موقع هاور پخش میشن -->
              <span class="acoustic-wave"></span>
              <span class="acoustic-wave wave-delay"></span>

              <svg
                class="size-4.5 relative z-10 transition-transform duration-300 group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                v-html="s.icon"
              />
            </a>
          </li>
        </ul>
      </div>

      <!-- ناوبری و لینک‌ها -->
      <nav class="min-w-0" :aria-label="t('footer.nav')">
        <div class="flex items-center gap-2 text-stone-400">
          <h2 class="text-sm font-medium uppercase tracking-wider">{{ t('nav.explore') }}</h2>
          <span class="text-xs text-key-active opacity-60">𝄞</span>
        </div>

        <ul class="mt-4 space-y-2.5">
          <li v-for="l in links" :key="l.to">
            <NuxtLink 
              :to="l.to" 
              class="musical-link group inline-flex items-center gap-2 text-sm text-stone-300 transition-colors duration-200 hover:text-key-active"
            >
              <!-- کلید نت مینیاتوری هنگام هاور -->
              <span class="note-cue text-xs opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-key-active">♪</span>
              <span>{{ t(l.label) }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- باشگاه مشتریان با تم آکورد و کلید پیانو -->
      <section aria-labelledby="club-title" class="min-w-0 sm:col-span-2 lg:col-span-1">
        <div class="flex items-center gap-2 text-stone-400">
          <h2 id="club-title" class="text-sm font-medium uppercase tracking-wider">
            {{ t('footer.clubName') }}
          </h2>
          <span class="h-1.5 w-1.5 rounded-full bg-key-active animate-ping"></span>
        </div>

        <p class="mt-3.5 text-sm text-stone-300 leading-relaxed">
          {{ t('footer.clubText') }}
        </p>

        <!-- پیام عضویت همراه با افکت ملودی -->
        <Transition
          enter-active-class="transition-all duration-400 ease-out"
          enter-from-class="opacity-0 translate-y-3 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
        >
          <div
            v-if="joined"
            class="mt-4 relative overflow-hidden rounded-lg border border-key-active/30 bg-key-active/10 p-3.5 text-sm text-key-active flex items-center gap-3"
            role="status"
          >
            <div class="flex size-7 items-center justify-center rounded-full bg-key-active/20 text-base">
              ♫
            </div>
            <div>
              <p class="font-medium">{{ t('footer.joined') }}</p>
            </div>
            <!-- نت‌های جشن موفقیت -->
            <span class="burst-note burst-1">♪</span>
            <span class="burst-note burst-2">♫</span>
          </div>
        </Transition>

        <!-- فرم ثبت نام با استایل کلاویه -->
        <form v-if="!joined" class="mt-4" novalidate @submit.prevent="join">
          <label for="club-email" class="sr-only">{{ t('footer.emailLabel') }}</label>
          <div class="flex flex-col gap-2.5 sm:flex-row">
            <div class="relative flex-1">
              <input
                id="club-email"
                v-model="email"
                type="email"
                inputmode="email"
                autocomplete="email"
                placeholder="you@example.com"
                dir="ltr"
                :aria-invalid="!!error"
                :aria-describedby="error ? 'club-email-error' : undefined"
                :class="[
                  'w-full min-w-0 rounded-lg border bg-stone-900/80 px-3.5 py-2.5 text-sm placeholder:text-stone-500 transition-all duration-300 focus:outline-none focus:ring-2',
                  error
                    ? 'border-red-400 focus:ring-red-400/40 animate-chord-error'
                    : 'border-stone-800 focus:ring-key-active/30 focus:shadow-[0_0_15px_rgba(var(--color-key-active-rgb,16,185,129),0.15)]',
                ]"
              />
            </div>

            <!-- دکمه شبیه کلاویه پیانو (با کلیک فیزیکی Key-Press) -->
            <button
              type="submit"
              class="piano-btn group relative shrink-0 overflow-hidden rounded-lg bg-key-active px-5 py-2.5 text-sm font-semibold text-stone-950 transition-all duration-150 hover:brightness-110 active:translate-y-0.5 active:shadow-inner disabled:opacity-50 sm:w-auto"
              :disabled="submitting"
            >
              <!-- خط براق بازتاب شبیه لاک پیانو -->
              <span class="lacquer-gloss absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"></span>
              
              <span class="relative z-10 flex items-center justify-center gap-1.5">
                <span v-if="submitting" class="size-3.5 animate-spin rounded-full border-2 border-stone-950 border-t-transparent"></span>
                <span>{{ t('footer.join') }}</span>
                <span class="text-xs transition-transform duration-200 group-hover:translate-x-0.5">♩</span>
              </span>
            </button>
          </div>

          <p v-if="error" id="club-email-error" class="mt-2 text-xs text-red-400 flex items-center gap-1" role="alert">
            <span>⚠️</span>
            {{ t('footer.invalidEmail') }}
          </p>
        </form>
      </section>
    </div>

    <!-- خط حامل موسیقی در فوتر پایانی -->
    <div class="relative border-t border-white/5 py-4 bg-stone-950/80">
      <div class="mx-auto flex max-w-5xl flex-col gap-2 px-4 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p class="min-w-0 flex items-center gap-1.5">
          <span>{{ t('footer.rights', { year }) }}</span>
        </p>
        <p class="min-w-0 sm:text-end flex items-center gap-1 sm:justify-end">
          <span class="opacity-70">{{ t('footer.poweredBy') }}</span>
          <span class="text-key-active inline-block animate-pulse">♫</span>
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* 1. اکولایزر ریتمیک موزیک */
.equalizer .eq-bar {
  width: 2.5px;
  background-color: var(--color-key-active, #10b981);
  border-radius: 1px;
  animation: equalize 1.2s ease-in-out infinite alternate;
}
.eq-bar.bar-1 { height: 40%; animation-duration: 0.8s; }
.eq-bar.bar-2 { height: 95%; animation-duration: 1.1s; animation-delay: 0.2s; }
.eq-bar.bar-3 { height: 60%; animation-duration: 0.9s; animation-delay: 0.4s; }
.eq-bar.bar-4 { height: 80%; animation-duration: 1.3s; animation-delay: 0.1s; }

@keyframes equalize {
  0% { height: 20%; opacity: 0.4; }
  50% { height: 100%; opacity: 1; }
  100% { height: 35%; opacity: 0.7; }
}

/* 2. نت‌های موسیقی شناور در پس‌زمینه (Floating Notes) */
.music-note {
  position: absolute;
  color: var(--color-key-active, #10b981);
  font-family: serif;
  user-select: none;
  animation: floatMusicNote 9s linear infinite;
}

.note-1 { left: 8%; font-size: 1.4rem; animation-duration: 8s; animation-delay: 0s; }
.note-2 { left: 28%; font-size: 1.8rem; animation-duration: 11s; animation-delay: 2s; }
.note-3 { left: 52%; font-size: 2.2rem; animation-duration: 13s; animation-delay: 4s; }
.note-4 { left: 74%; font-size: 1.2rem; animation-duration: 9s; animation-delay: 1.5s; }
.note-5 { left: 88%; font-size: 1.6rem; animation-duration: 10s; animation-delay: 3s; }
.note-6 { left: 40%; font-size: 1.1rem; animation-duration: 12s; animation-delay: 6s; }

@keyframes floatMusicNote {
  0% {
    bottom: -30px;
    opacity: 0;
    transform: translateX(0) rotate(-10deg);
  }
  20% {
    opacity: 0.6;
  }
  50% {
    transform: translateX(25px) rotate(15deg);
  }
  80% {
    opacity: 0.4;
  }
  100% {
    bottom: 105%;
    opacity: 0;
    transform: translateX(-20px) rotate(30deg);
  }
}

/* 3. رزونانس صوتی آیکون‌های شبکه‌های اجتماعی (Soundwave Acoustic Rings) */
.social-btn {
  position: relative;
}

.social-btn:hover {
  box-shadow: 0 0 20px -2px var(--social-color);
  background: var(--social-color);
}

.acoustic-wave {
  position: absolute;
  inset: -1px;
  border-radius: 9999px;
  border: 1.5px solid var(--social-color);
  opacity: 0;
  pointer-events: none;
}

.social-btn:hover .acoustic-wave {
  animation: acousticRing 1.4s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
}

.social-btn:hover .wave-delay {
  animation-delay: 0.6s;
}

@keyframes acousticRing {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

/* 4. کلاویه‌های بالای فوتر (Piano Key Depress Action) */
.piano-key:active,
.piano-key:hover {
  transform: translateY(2px);
}

/* 5. لرزش فالش هنگام خطای ایمیل (Discordant Chord Shake) */
@keyframes chordError {
  0%, 100% { transform: translateX(0); }
  15%, 45%, 75% { transform: translateX(-5px) rotate(-0.5deg); }
  30%, 60%, 90% { transform: translateX(5px) rotate(0.5deg); }
}

.animate-chord-error {
  animation: chordError 0.45s ease-in-out;
}

/* 6. پرتاب نت‌های موفقیت ثبت نام (Note Burst) */
.burst-note {
  position: absolute;
  font-size: 1.1rem;
  opacity: 0;
  animation: burstUp 1.8s ease-out infinite;
}
.burst-1 { right: 20px; animation-delay: 0.2s; }
.burst-2 { right: 45px; animation-delay: 0.7s; }

@keyframes burstUp {
  0% { transform: translateY(10px) scale(0.6); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-30px) scale(1.2); opacity: 0; }
}

/* 7. رفتار دکمه پیانویی (Piano Tactile Key Press) */
.piano-btn {
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.4);
}
.piano-btn:active {
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
}
</style>