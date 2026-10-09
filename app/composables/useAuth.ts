import type { AuthUser, StoredUser, UserProfile } from '~/utils/auth'

type Fail = { ok: false; error: MessageRef }
type Result<T = object> = ({ ok: true } & T) | Fail

// TODO(backend): کد پیامکی و «تأیید شماره» فعلاً غیرفعاله (بک‌اند نداریم).
// وقتی بک‌اند اومد، کدهای کامنت‌شده‌ی پایین رو برگردون و به API وصل کن.
// interface PendingOtp {
//     phone: string
//     code: string
//     sentAt: number
//     expiresAt: number
//     attempts: number
// }
// let pending: PendingOtp | null = null
// let verified: { phone: string; until: number } | null = null

const fail = (error: MessageRef): Fail => ({ ok: false, error })

/** خطای ناشناخته → پیام ترجمه‌شده؛ فقط خطای «اتصال امن» پیام اختصاصی داره */
const errorRef = (e: unknown, fallback: string): MessageRef =>
    e instanceof Error && e.message === SECURE_CONTEXT_ERROR ? msgRef('auth.errors.secureContext') : msgRef(fallback)

// function newCode(): string {
//     const n = crypto.getRandomValues(new Uint32Array(1))[0]! % 10 ** OTP_LENGTH
//     return String(n).padStart(OTP_LENGTH, '0')
// }

export function useAuth() {
    const session = useSessionCookie()
    // حرف اول اسم توی کوکی هم نگه داشته می‌شه تا سرور و کلاینت از همون اول یک چیز رندر کنن (بدون پرش آیکون → حرف)
    const initialCookie = useCookie<string>('piano-initial', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, default: () => '' })
    const users = useState<StoredUser[]>('auth:users', () => [])
    const ready = useState('auth:ready', () => false)

    // بعد از hydrate لود می‌شه تا خروجی سرور و کلاینت یکی بمونه
    if (import.meta.client && !ready.value) {
        onNuxtReady(() => {
            if (ready.value) return
            users.value = readUsers()
            ready.value = true
            // کوکی نشستِ قدیمی که کاربرش دیگه وجود نداره
            if (session.value && !user.value) session.value = null
            syncInitial()
        })
    }

    const user = computed<AuthUser | null>(() => {
        const found = users.value.find((u) => u.id === session.value)
        return found ? toAuthUser(found) : null
    })
    // تا قبل از لود شدن کاربران، به کوکی اعتماد می‌کنیم؛ بعدش به وجود واقعی کاربر
    const isLoggedIn = computed(() => (ready.value ? !!user.value : !!session.value))
    const initial = computed(() =>
        ready.value || user.value
            ? (user.value?.profile.displayName.trim().charAt(0).toUpperCase() ?? '')
            : session.value ? initialCookie.value : '',
    )

    function syncInitial() {
        initialCookie.value = session.value ? (user.value?.profile.displayName.trim().charAt(0).toUpperCase() ?? '') : ''
    }

    function save(next: StoredUser[]) {
        writeUsers(next)
        users.value = next
    }

    /** شماره قبلاً ثبت شده و رمز داره؟ */
    function lookup(rawPhone: string): { hasPassword: boolean } {
        const phone = normalizePhone(rawPhone)
        const found = readUsers().find((u) => u.phone === phone)
        return { hasPassword: !!found?.passwordHash }
    }

    /** ساخت حساب فقط با موبایل + رمز (بدون تأیید پیامکی). کاربر بعدش مستقیم وارد می‌شه. */
    async function register(rawPhone: string, password: string): Promise<Result<{ isNew: boolean }>> {
        const invalidPhone = validatePhone(rawPhone)
        if (invalidPhone) return fail(invalidPhone)
        const invalid = validatePassword(password)
        if (invalid) return fail(invalid)
        const phone = normalizePhone(rawPhone)

        try {
            const salt = randomHex()
            const passwordHash = await hashPassword(password, salt)
            const all = readUsers()
            const existing = all.find((u) => u.phone === phone)
            let id: string
            if (existing) {
                // شماره ثبت شده ولی هنوز رمز نداره
                existing.salt = salt
                existing.passwordHash = passwordHash
                id = existing.id
            } else {
                id = `u${randomHex(8)}` // پیشوند: useCookie مقدارِ فقط‌عددی/علمی رو به number تبدیل می‌کنه
                all.push({ id, phone, salt, passwordHash, createdAt: new Date().toISOString(), profile: createEmptyProfile() })
            }
            save(all)
            session.value = id
            ready.value = true
            syncInitial()
            return { ok: true, isNew: !existing }
        } catch (e) {
            return fail(errorRef(e, 'auth.errors.savePassword'))
        }
    }

    // ---------- غیرفعال تا وقتی بک‌اند بیاد: ارسال کد، تأیید کد، ثبت رمز بعد از تأیید ----------
    // /** ارسال کد پیامکی. TODO: اینجا باید به سرویس پیامک وصل بشه. */
    // async function requestCode(rawPhone: string): Promise<Result<{ devCode?: string }>> {
    //     const invalid = validatePhone(rawPhone)
    //     if (invalid) return fail(invalid)
    //     const phone = normalizePhone(rawPhone)

    //     if (pending?.phone === phone) {
    //         const wait = Math.ceil((pending.sentAt + OTP_RESEND_SECONDS * 1000 - Date.now()) / 1000)
    //         if (wait > 0) return fail(msgRef('auth.errors.waitResend', { seconds: wait }))
    //     }

    //     const code = newCode()
    //     const now = Date.now()
    //     pending = { phone, code, sentAt: now, expiresAt: now + OTP_TTL_MS, attempts: 0 }
    //     verified = null

    //     if (import.meta.dev) console.info(`[auth] verification code for ${phone}: ${code}`)
    //     // فقط توی حالت توسعه کد برگردونده می‌شه تا بدون پیامک هم بشه تست کرد
    //     return { ok: true, devCode: import.meta.dev ? code : undefined }
    // }

    // async function verifyCode(rawPhone: string, rawCode: string): Promise<Result> {
    //     const phone = normalizePhone(rawPhone)
    //     const code = normalizeDigits(rawCode).trim()
    //     if (!pending || pending.phone !== phone) return fail(msgRef('auth.errors.requestCodeFirst'))
    //     if (Date.now() > pending.expiresAt) {
    //         pending = null
    //         return fail(msgRef('auth.errors.codeExpired'))
    //     }
    //     pending.attempts++
    //     if (code !== pending.code) {
    //         if (pending.attempts >= OTP_MAX_ATTEMPTS) {
    //             pending = null
    //             return fail(msgRef('auth.errors.tooManyAttempts'))
    //         }
    //         return fail(msgRef('auth.errors.wrongCode'))
    //     }
    //     pending = null
    //     verified = { phone, until: Date.now() + 10 * 60 * 1000 }
    //     return { ok: true }
    // }

    // /** بعد از تأیید کد: برای کاربر جدید حساب می‌سازه، برای بقیه رمز رو عوض می‌کنه، و واردش می‌کنه */
    // async function setPassword(rawPhone: string, password: string): Promise<Result<{ isNew: boolean }>> {
    //     const phone = normalizePhone(rawPhone)
    //     if (!verified || verified.phone !== phone || Date.now() > verified.until) {
    //         return fail(msgRef('auth.errors.verificationExpired'))
    //     }
    //     const invalid = validatePassword(password)
    //     if (invalid) return fail(invalid)

    //     try {
    //         const salt = randomHex()
    //         const passwordHash = await hashPassword(password, salt)
    //         const all = readUsers()
    //         const existing = all.find((u) => u.phone === phone)
    //         let id: string
    //         if (existing) {
    //             existing.salt = salt
    //             existing.passwordHash = passwordHash
    //             id = existing.id
    //         } else {
    //             id = `u${randomHex(8)}` // پیشوند: useCookie مقدارِ فقط‌عددی/علمی رو به number تبدیل می‌کنه
    //             all.push({ id, phone, salt, passwordHash, createdAt: new Date().toISOString(), profile: createEmptyProfile() })
    //         }
    //         save(all)
    //         verified = null
    //         session.value = id
    //         ready.value = true
    //         syncInitial()
    //         return { ok: true, isNew: !existing }
    //     } catch (e) {
    //         return fail(errorRef(e, 'auth.errors.savePassword'))
    //     }
    // }

    async function login(input: { phone: string; password: string }): Promise<Result> {
        const phone = normalizePhone(input.phone)
        const found = readUsers().find((u) => u.phone === phone)
        try {
            if (found?.passwordHash && (await hashPassword(input.password, found.salt)) === found.passwordHash) {
                users.value = readUsers()
                session.value = found.id
                ready.value = true
                syncInitial()
                return { ok: true }
            }
        } catch (e) {
            return fail(errorRef(e, 'auth.errors.login'))
        }
        return fail(msgRef('auth.errors.incorrectPassword'))
    }

    async function updateProfile(profile: UserProfile): Promise<Result> {
        const all = readUsers()
        const found = all.find((u) => u.id === session.value)
        if (!found) return fail(msgRef('auth.errors.notLoggedIn'))
        found.profile = profile
        try {
            save(all)
        } catch {
            return fail(msgRef('auth.errors.saveProfile'))
        }
        syncInitial()
        return { ok: true }
    }

    function logout() {
        session.value = null
        syncInitial()
    }

    return { user, ready, isLoggedIn, initial, lookup, register, login, updateProfile, logout }
    // وقتی بک‌اند اومد: requestCode, verifyCode, setPassword رو هم برگردون
}