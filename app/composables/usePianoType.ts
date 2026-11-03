export const usePianoType = () => {
  const route = useRoute()
  const saved = useCookie<number | undefined>('piano-keys', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  watch(
    () => route.query.keys,
    (q) => {
      if (q !== undefined) saved.value = getPianoType(q).keys
    },
    { immediate: true },
  )

  return computed(() => getPianoType(route.query.keys ?? saved.value))
}