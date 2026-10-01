/**
 * نوع پیانوی فعلی: اول از کوئری (?keys=61)، بعد از آخرین انتخاب ذخیره‌شده (کوکی)،
 * و در غیر این صورت پیش‌فرض. کوکی باعث می‌شه توی صفحه‌هایی مثل تنظیمات هم
 * منوی هدر انتخاب قبلی رو نشون بده.
 */
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