/** سطح‌های مهارت پیانو برای فرم پروفایل */
export const PIANO_LEVELS = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'professional', label: 'Professional' },
] as const

export type PianoLevel = (typeof PIANO_LEVELS)[number]['value']

/** سبک‌های موسیقی قابل انتخاب در پروفایل */
export const FAVORITE_GENRES = ['Classical', 'Jazz', 'Pop', 'Rock', 'Film & game music', 'Folk', 'Other'] as const

/** اطلاعاتی که کاربر خودش توی صفحه‌ی پروفایل تکمیل می‌کنه */
export interface UserProfile {
    displayName: string
    bio: string
    country: string
    level: PianoLevel | ''
    favoriteGenre: string
    yearsPlaying: number | null
}

/** رکورد کاربر همون‌طور که ذخیره می‌شه (فعلاً localStorage، بعداً جواب بک‌اند) */
export interface StoredUser {
    id: string
    email: string
    salt: string
    passwordHash: string
    createdAt: string
    profile: UserProfile
}

/** کاربر برای نمایش توی رابط؛ بدون اطلاعات رمز */
export type AuthUser = Omit<StoredUser, 'salt' | 'passwordHash'>

export const SESSION_COOKIE = 'piano-session'
export const USERS_STORAGE_KEY = 'web-piano:users:v1'

export const DISPLAY_NAME_MAX = 40
export const BIO_MAX = 280
export const PASSWORD_MIN = 8

export function createEmptyProfile(displayName = ''): UserProfile {
    return { displayName, bio: '', country: '', level: '', favoriteGenre: '', yearsPlaying: null }
}

export function toAuthUser(user: StoredUser): AuthUser {
    const { salt: _salt, passwordHash: _hash, ...rest } = user
    return rest
}

/** درصد تکمیل پروفایل (۰ تا ۱۰۰) */
export function profileCompletion(p: UserProfile): number {
    const filled = [
        p.displayName.trim(),
        p.bio.trim(),
        p.country.trim(),
        p.level,
        p.favoriteGenre,
        p.yearsPlaying !== null ? 'y' : '',
    ].filter(Boolean).length
    return Math.round((filled / 6) * 100)
}

// ---------- اعتبارسنجی؛ پیام خطا یا null ----------

export function validateEmail(value: string): string | null {
    const v = value.trim()
    if (!v) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address.'
    return null
}

export function validatePassword(value: string): string | null {
    if (!value) return 'Password is required.'
    if (value.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters.`
    if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Use at least one letter and one number.'
    return null
}

export function validateDisplayName(value: string): string | null {
    const v = value.trim()
    if (!v) return 'Name is required.'
    if (v.length < 2) return 'Name must be at least 2 characters.'
    if (v.length > DISPLAY_NAME_MAX) return `Name must be at most ${DISPLAY_NAME_MAX} characters.`
    return null
}

/** فقط مسیرهای داخلی سایت برای redirect بعد از لاگین پذیرفته می‌شن */
export function getSafeRedirect(value: unknown, fallback = '/'): string {
    if (typeof value !== 'string') return fallback
    if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback
    return value
}

// ---------- ذخیره‌سازی موقت سمت کلاینت ----------

export function readUsers(): StoredUser[] {
    try {
        const raw = localStorage.getItem(USERS_STORAGE_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        return Array.isArray(parsed) ? parsed : []
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

/** هش SHA-256 با salt. فقط برای دمو؛ وقتی بک‌اند اومد هش کردن سمت سرور انجام می‌شه. */
export async function hashPassword(password: string, salt: string): Promise<string> {
    if (!globalThis.crypto?.subtle) throw new Error('Secure context required (use HTTPS or localhost).')
    const data = new TextEncoder().encode(`${salt}:${password}`)
    return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', data)))
}