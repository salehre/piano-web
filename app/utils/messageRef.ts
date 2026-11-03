export type MessageParam = string | number | MessageRef | MessageParam[]

export interface MessageRef {
  key: string
  params?: Record<string, MessageParam>
}

export const msgRef = (key: string, params?: Record<string, MessageParam>): MessageRef =>
  params ? { key, params } : { key }
