export default defineNuxtPlugin((nuxtApp) => {
  const midi = useMidi()

  nuxtApp.hook('app:mounted', () => {
    void midi.autoConnect()
  })
})