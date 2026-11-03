<script setup lang="ts">
import { Toaster, toast } from 'vue-sonner'
import 'vue-sonner/style.css'

// تنها جایی که <Toaster> رندر می‌شه (توی app.vue)؛ بقیه‌ی برنامه فقط toast.success(...) و امثالش رو صدا می‌زنه.
// رویدادهای عمومی (MIDI، آنلاین/آفلاین) هم همین‌جا گوش داده می‌شن تا به هیچ صفحه‌ای وابسته نباشن.
const { t, localeProperties } = useI18n()
const { isLight } = useTheme()
const text = useToastText()
const { status, devices } = useMidi()

// ---------- MIDI: وصل و جدا شدن دستگاه ----------
const knownDevices = new Map<string, string>()
const deviceName = (name: string) => name || t('settings.midi.unknownDevice')

watch(devices, (list) => {
  const current = new Map(list.filter((d) => d.connected).map((d) => [d.id, deviceName(d.name)]))
  for (const [id, name] of current) {
    if (!knownDevices.has(id)) toast.success(text.value.midiConnected.replace('{name}', name), { id: `midi-${id}` })
  }
  for (const [id, name] of knownDevices) {
    if (!current.has(id)) toast.info(text.value.midiDisconnected.replace('{name}', name), { id: `midi-${id}` })
  }
  knownDevices.clear()
  current.forEach((name, id) => knownDevices.set(id, name))
})

// فقط وقتی کاربر خودش «اتصال» زده و رد شده/خطا خورده؛ نه موقع بررسی خودکار شروع برنامه
watch(status, (next, prev) => {
  if (prev === 'requesting' && (next === 'denied' || next === 'error')) {
    toast.error(t(`settings.midi.status.${next}`))
  }
})

// ---------- اینترنت ----------
function onOffline() {
  toast.error(text.value.offline, { id: 'network', duration: Infinity })
}
function onOnline() {
  toast.success(text.value.online, { id: 'network', duration: 3000 })
}
onMounted(() => {
  window.addEventListener('offline', onOffline)
  window.addEventListener('online', onOnline)
})
onBeforeUnmount(() => {
  window.removeEventListener('offline', onOffline)
  window.removeEventListener('online', onOnline)
})
</script>

<template>
  <ClientOnly>
    <Toaster
      :theme="isLight ? 'light' : 'dark'"
      :dir="localeProperties.dir ?? 'ltr'"
      position="top-center"
      :duration="3500"
      :visible-toasts="3"
      close-button
      :toast-options="{ class: 'piano-toast' }"
    />
  </ClientOnly>
</template>

<style>
/* رنگ‌ها از پالت تم فعلی می‌آن (var(--color-stone-*))، پس با عوض شدن تم خودکار عوض می‌شن.
   دو بار تکرار attribute فقط برای بالا بردن specificity روی استایل پیش‌فرض sonner ـه */
html [data-sonner-toaster][data-sonner-toaster] {
  --normal-bg: color-mix(in srgb, var(--color-stone-900) 92%, transparent);
  --normal-text: var(--color-stone-100);
  --normal-border: var(--color-stone-700);
  font-family: inherit;
}

.piano-toast {
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 20px 40px -12px rgb(0 0 0 / 0.45);
}

.piano-toast[data-type='success'] [data-icon] { color: #34d399; }
.piano-toast[data-type='error'] [data-icon] { color: #f87171; }
.piano-toast[data-type='info'] [data-icon] { color: var(--color-key-active); }
</style>
