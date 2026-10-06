export default defineNuxtPlugin((nuxtApp) => {
  const midi = useMidi()

  // اگه کاربر قبلاً اجازه‌ی MIDI داده، بعد از بالا اومدن برنامه خودکار وصل می‌شه
  nuxtApp.hook('app:mounted', () => {
    void midi.autoConnect()
  })
})