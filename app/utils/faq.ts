/**
 * شناسه‌ی سؤال‌های متداول صفحه‌ی اصلی؛ متن سؤال و جواب توی i18n/locales/<زبان>/home.json
 * زیر faq.items.<id>.question / .answer است. ترتیب نمایش همین ترتیب لیسته.
 */
export const FAQ_IDS = ['install', 'play', 'shortcuts', 'size', 'record', 'noSound', 'mobile'] as const
export type FaqId = (typeof FAQ_IDS)[number]
