import { bind } from 'cuelume'

export default defineNuxtPlugin((nuxtApp) => {
  const sounds = useUiSounds()

  bind()

  nuxtApp.hook('app:mounted', () => sounds.load())
})