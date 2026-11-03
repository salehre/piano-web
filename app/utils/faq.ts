export const FAQ_IDS = [
  'install',
  'loadSounds',
  'play',
  'shortcuts',
  'size',
  'record',
  'midi',
  'noSound',
  'mobile',
] as const
export type FaqId = (typeof FAQ_IDS)[number]
