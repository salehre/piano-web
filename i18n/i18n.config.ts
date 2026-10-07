const dateLong = { year: 'numeric', month: 'long', day: 'numeric' } as const
const numbers = {
  /** عدد ساده بدون جداکننده‌ی هزارگان (مثلاً سال) */
  plain: { useGrouping: false },
  percent: { style: 'percent', maximumFractionDigits: 0 },
} as const

export default defineI18nConfig(() => ({
  // متن گم‌شده توی هر زبان از انگلیسی برداشته می‌شه
  fallbackLocale: 'en',
  datetimeFormats: {
    en: { long: dateLong },
    // تقویم شمسی برای فارسی؛ اگه میلادی می‌خوای calendar: 'gregory' بذار
    fa: { long: { ...dateLong, calendar: 'persian' } },
  },
  // ارقام فارسی به‌صورت خودکار توی n() و d() برای زبان fa اعمال می‌شن
  numberFormats: { en: numbers, fa: numbers },
}))
