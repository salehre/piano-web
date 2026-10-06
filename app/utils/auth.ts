/** سطح‌های مهارت پیانو (برای PianoFinder) */
export const PIANO_LEVELS = [
    { value: 'never', label: 'Never played' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'late-beginner', label: 'Late beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'professional', label: 'Professional' },
] as const

export type PianoLevel = (typeof PIANO_LEVELS)[number]['value']

/** سبک‌های موسیقی (برای PianoFinder) */
export const FAVORITE_GENRES = ['Classical', 'Jazz', 'Pop', 'Rock', 'Film & game music', 'Folk', 'Other'] as const

/** اطلاعاتی که کاربر خودش توی صفحه‌ی پروفایل تکمیل می‌کنه */
export interface UserProfile {
    displayName: string
    /** کد ملی ۱۰ رقمی (انگلیسی)؛ خالی یعنی ثبت نشده */
    nationalId: string
    country: string
    address: string
    yearsPlaying: number | null
}

/** رکورد کاربر همون‌طور که ذخیره می‌شه (فعلاً localStorage، بعداً جواب بک‌اند) */
export interface StoredUser {
    id: string
    /** شماره‌ی موبایل نرمال‌شده، مثل 09123456789 */
    phone: string
    salt: string
    /** تا وقتی کاربر رمز انتخاب نکرده null است */
    passwordHash: string | null
    createdAt: string
    profile: UserProfile
}

/** کاربر برای نمایش توی رابط؛ بدون اطلاعات رمز */
export type AuthUser = Omit<StoredUser, 'salt' | 'passwordHash'>

export const SESSION_COOKIE = 'piano-session'
export const USERS_STORAGE_KEY = 'web-piano:users:v2' // v2: ورود با موبایل به‌جای ایمیل

/** کد یک‌بارمصرف پیامکی */
export const OTP_LENGTH = 5
export const OTP_TTL_MS = 2 * 60 * 1000
export const OTP_RESEND_SECONDS = 60
export const OTP_MAX_ATTEMPTS = 5

export const DISPLAY_NAME_MAX = 40
export const ADDRESS_MAX = 300
export const PASSWORD_MIN = 8

export function createEmptyProfile(displayName = ''): UserProfile {
    return { displayName, nationalId: '', country: '', address: '', yearsPlaying: null }
}

export function toAuthUser(user: StoredUser): AuthUser {
    const { salt: _salt, passwordHash: _hash, ...rest } = user
    return rest
}

/** درصد تکمیل پروفایل (۰ تا ۱۰۰) */
export function profileCompletion(p: UserProfile): number {
    const filled = [
        p.displayName.trim(),
        p.nationalId.trim(),
        p.country.trim(),
        p.address.trim(),
        p.yearsPlaying !== null ? 'y' : '',
    ].filter(Boolean).length
    return Math.round((filled / 5) * 100)
}

// ---------- اعتبارسنجی؛ پیام خطا یا null ----------

/** رقم‌های فارسی/عربی رو به انگلیسی تبدیل می‌کنه */
export function normalizeDigits(value: string): string {
    return value
        .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
        .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
}

/** شماره‌ی موبایل ایران رو به شکل 09xxxxxxxxx درمیاره (+98، 0098 و بدون صفر هم قبول) */
export function normalizePhone(value: string): string {
    const v = normalizeDigits(value).replace(/[\s\-()]/g, '')
    if (v.startsWith('+98')) return `0${v.slice(3)}`
    if (v.startsWith('0098')) return `0${v.slice(4)}`
    if (/^98\d{10}$/.test(v)) return `0${v.slice(2)}`
    if (/^9\d{9}$/.test(v)) return `0${v}`
    return v
}

export function validatePhone(value: string): string | null {
    if (!value.trim()) return 'Mobile number is required.'
    if (!/^09\d{9}$/.test(normalizePhone(value))) return 'Enter a valid mobile number.'
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

/** کد ملی ایران: ۱۰ رقم + بررسی رقم کنترل. خالی مجازه (اختیاری). */
export function validateNationalId(value: string): string | null {
    const v = normalizeDigits(value).trim()
    if (!v) return null
    if (!/^\d{10}$/.test(v)) return 'National ID must be exactly 10 digits.'
    if (/^(\d)\1{9}$/.test(v)) return 'Enter a valid National ID.'
    const digits = v.split('').map(Number)
    const sum = digits.slice(0, 9).reduce((acc, d, i) => acc + d * (10 - i), 0)
    const r = sum % 11
    const check = r < 2 ? r : 11 - r
    return check === digits[9] ? null : 'Enter a valid National ID.'
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
        if (!Array.isArray(parsed)) return []
        // کاربرهای قدیمی (با bio/level/favoriteGenre) به شکل جدید پروفایل مهاجرت داده می‌شن
        return parsed.map((u: StoredUser) => {
            const p: Partial<UserProfile> = u.profile ?? {}
            return {
                ...u,
                profile: {
                    displayName: p.displayName ?? '',
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

/** هش SHA-256 با salt. فقط برای دمو؛ وقتی بک‌اند اومد هش کردن سمت سرور انجام می‌شه. */
export async function hashPassword(password: string, salt: string): Promise<string> {
    if (!globalThis.crypto?.subtle) throw new Error('Secure context required (use HTTPS or localhost).')
    const data = new TextEncoder().encode(`${salt}:${password}`)
    return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', data)))
}