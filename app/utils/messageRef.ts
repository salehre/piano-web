/**
 * منطق برنامه (اعتبارسنجی، سرویس لاگین، پیشنهاد پیانو) نباید متن نهایی تولید کنه.
 * به‌جاش یک «ارجاع به پیام» برمی‌گردونه و کامپوننت با useTr() اون رو به زبان فعلی ترجمه می‌کنه.
 * مزیتش: با عوض شدن زبان، خطاها و پیام‌هایی که روی صفحه‌ان هم همون لحظه ترجمه می‌شن.
 */
export type MessageParam = string | number | MessageRef | MessageParam[]

export interface MessageRef {
  key: string
  params?: Record<string, MessageParam>
}

export const msgRef = (key: string, params?: Record<string, MessageParam>): MessageRef =>
  params ? { key, params } : { key }
