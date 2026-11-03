
export type InputFilterKind = 'phone' | 'digits' | 'email' | 'password' | 'name'

interface Rule {
  keep: RegExp
  silent: RegExp
}

const RULES: Record<InputFilterKind, Rule> = {
  phone: { keep: /[0-9]/, silent: /[\s\-()+]/ },
  digits: { keep: /[0-9]/, silent: /[\s,.\-٬٫]/ },
  email: { keep: /[A-Za-z0-9._%+\-@]/, silent: /\s/ },
  password: { keep: /[\x21-\x7E]/, silent: /\s/ },
  name: { keep: /[\p{L}\p{M}\u200c '’.\-]/u, silent: /[\t\n\r]/ },
}

const PHONE_MAX = 11

export function applyFilter(
  kind: InputFilterKind,
  raw: string,
  maxLength?: number,
): { value: string; rejected: boolean } {
  const rule = RULES[kind]
  let v = kind === 'password' ? raw : normalizeDigits(raw)

  if (kind === 'phone') {
    v = v.replace(/[\s\-()]/g, '')
    if (v.startsWith('+98')) v = `0${v.slice(3)}`
    else if (v.startsWith('0098')) v = `0${v.slice(4)}`
    else if (/^98\d{10}$/.test(v)) v = `0${v.slice(2)}`
  }

  let rejected = false
  let kept = ''
  for (const ch of v) {
    if (rule.keep.test(ch)) kept += ch
    else if (!rule.silent.test(ch)) rejected = true
  }

  if (kind === 'name') kept = kept.replace(/ {2,}/g, ' ').replace(/^ /, '')

  const limit = kind === 'phone' ? PHONE_MAX : maxLength
  if (limit && kept.length > limit) kept = kept.slice(0, limit)

  return { value: kept, rejected }
}

export function isEmail(value: string): boolean {
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(value)) return false
  const [local = '', domain = ''] = value.split('@')
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false
  return !domain.split('.').some((part) => part.startsWith('-') || part.endsWith('-'))
}
