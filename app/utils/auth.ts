export interface UserProfile {
    displayName: string
    email: string
    avatar: string
    nationalId: string
    country: string
    address: string
    yearsPlaying: number | null
}

export interface StoredUser {
    id: string
    phone: string
    salt: string
    passwordHash: string | null
    createdAt: string
    profile: UserProfile
}

export type AuthUser = Omit<StoredUser, 'salt' | 'passwordHash'>

export const SESSION_COOKIE = 'piano-session'
export const USERS_STORAGE_KEY = 'web-piano:users:v2'

export const OTP_LENGTH = 5
export const OTP_TTL_MS = 2 * 60 * 1000
export const OTP_RESEND_SECONDS = 60
export const OTP_MAX_ATTEMPTS = 5

export const DISPLAY_NAME_MIN = 2
export const DISPLAY_NAME_MAX = 40
export const ADDRESS_MAX = 300
export const EMAIL_MAX = 100

export const AVATAR_SIZE = 256
export const AVATAR_MAX_FILE_BYTES = 5 * 1024 * 1024
export const PASSWORD_MIN = 8
export const YEARS_PLAYING_MAX = 80

export function createEmptyProfile(displayName = ''): UserProfile {
    return { displayName, email: '', avatar: '', nationalId: '', country: '', address: '', yearsPlaying: null }
}

export function toAuthUser(user: StoredUser): AuthUser {
    const { salt: _salt, passwordHash: _hash, ...rest } = user
    return rest
}

export function profileCompletion(p: UserProfile): number {
    const filled = [
        p.displayName.trim(),
        p.email.trim(),
        p.nationalId.trim(),
        p.country.trim(),
        p.address.trim(),
        p.yearsPlaying !== null ? 'y' : '',
    ].filter(Boolean).length
    return Math.round((filled / 6) * 100)
}

export function normalizeDigits(value: string): string {
    return value
        .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
        .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
}

export function normalizePhone(value: string): string {
    const v = normalizeDigits(value).replace(/[\s\-()]/g, '')
    if (v.startsWith('+98')) return `0${v.slice(3)}`
    if (v.startsWith('0098')) return `0${v.slice(4)}`
    if (/^98\d{10}$/.test(v)) return `0${v.slice(2)}`
    if (/^9\d{9}$/.test(v)) return `0${v}`
    return v
}

export function validatePhone(value: string): MessageRef | null {
    if (!value.trim()) return msgRef('auth.validation.phoneRequired')
    if (!/^09\d{9}$/.test(normalizePhone(value))) return msgRef('auth.validation.phoneInvalid')
    return null
}

export function validatePassword(value: string): MessageRef | null {
    if (!value) return msgRef('auth.validation.passwordRequired')
    if (value.length < PASSWORD_MIN) return msgRef('auth.validation.passwordMin', { min: PASSWORD_MIN })
    if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return msgRef('auth.validation.passwordMix')
    return null
}

export function validateDisplayName(value: string): MessageRef | null {
    const v = value.trim()
    if (!v) return msgRef('auth.validation.nameRequired')
    // طول واقعی نام یعنی تعداد حروف (عدد و علامت حساب نمی‌شن)
    if (Array.from(v.matchAll(/\p{L}/gu)).length < DISPLAY_NAME_MIN) return msgRef('auth.validation.nameMin', { min: DISPLAY_NAME_MIN })
    if (v.length > DISPLAY_NAME_MAX) return msgRef('auth.validation.nameMax', { max: DISPLAY_NAME_MAX })
    return null
}

export function validateEmail(value: string): MessageRef | null {
    const v = value.trim()
    if (!v) return null
    if (v.length > EMAIL_MAX) return msgRef('auth.validation.emailMax', { max: EMAIL_MAX })
    if (!isEmail(v)) return msgRef('auth.validation.emailInvalid')
    return null
}

export function validateNationalId(value: string): MessageRef | null {
    const v = normalizeDigits(value).trim()
    if (!v) return null
    if (!/^\d{10}$/.test(v)) return msgRef('auth.validation.nationalIdLength', { length: 10 })
    if (/^(\d)\1{9}$/.test(v)) return msgRef('auth.validation.nationalIdInvalid')
    const digits = v.split('').map(Number)
    const sum = digits.slice(0, 9).reduce((acc, d, i) => acc + d * (10 - i), 0)
    const r = sum % 11
    const check = r < 2 ? r : 11 - r
    return check === digits[9] ? null : msgRef('auth.validation.nationalIdInvalid')
}

export function getSafeRedirect(value: unknown, fallback = '/'): string {
    if (typeof value !== 'string') return fallback
    if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback
    return value
}

export function readUsers(): StoredUser[] {
    try {
        const raw = localStorage.getItem(USERS_STORAGE_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        if (!Array.isArray(parsed)) return []
        return parsed.map((u: StoredUser) => {
            const p: Partial<UserProfile> = u.profile ?? {}
            return {
                ...u,
                profile: {
                    displayName: p.displayName ?? '',
                    email: p.email ?? '',
                    avatar: p.avatar ?? '',
                    nationalId: p.nationalId ?? '',
                    country: p.country ?? '',
                    address: p.address ?? '',
                    yearsPlaying: p.yearsPlaying ?? null,
                },
            }
        })
    } catch {
        return []
    }
}

export function writeUsers(users: StoredUser[]) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

function toHex(bytes: Uint8Array) {
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function randomHex(byteLength = 16): string {
    return toHex(crypto.getRandomValues(new Uint8Array(byteLength)))
}

export const SECURE_CONTEXT_ERROR = 'SECURE_CONTEXT_REQUIRED'

export async function hashPassword(password: string, salt: string): Promise<string> {
    if (!globalThis.crypto?.subtle) throw new Error(SECURE_CONTEXT_ERROR)
    const data = new TextEncoder().encode(`${salt}:${password}`)
    return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', data)))
}