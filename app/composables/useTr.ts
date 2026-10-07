/**
 * MessageRef رو به متن زبان فعلی تبدیل می‌کنه.
 *  - عددها با n() فرمت می‌شن (ارقام فارسی توی زبان fa)
 *  - آرایه‌ها با Intl.ListFormat به‌هم وصل می‌شن («پاپ، راک و فولک» / "Pop, Rock, and Folk")
 *  - MessageRef توی پارامترها هم بازگشتی ترجمه می‌شه
 * ورودی null/undefined → undefined (برای پراپ error کامپوننت‌ها)
 */
export function useTr() {
  const { t, n, locale } = useI18n()

  function resolve(p: MessageParam): string {
    if (typeof p === 'number') return n(p)
    if (typeof p === 'string') return p
    if (Array.isArray(p)) {
      return new Intl.ListFormat(locale.value, { style: 'long', type: 'conjunction' }).format(p.map(resolve))
    }
    return tr(p)!
  }

  function tr(ref: MessageRef | null | undefined): string | undefined {
    if (!ref) return undefined
    if (!ref.params) return t(ref.key)
    const params = Object.fromEntries(Object.entries(ref.params).map(([k, v]) => [k, resolve(v)]))
    return t(ref.key, params)
  }

  return tr
}
