import type { AuthUser, StoredUser, UserProfile } from '~/utils/auth'

type Fail = { ok: false; error: string }
type Result<T = object> = ({ ok: true } & T) | Fail

// کد پیامکی و «تأیید شماره» فقط توی حافظه‌ی همین تب نگه داشته می‌شن (نه storage)
// وقتی بک‌اند اومد، این بخش و requestCode/verifyCode به API وصل می‌شن.
interface PendingOtp {
    phone: string
    code: string
    sentAt: number
    expiresAt: number
    attempts: number
}
let pending: PendingOtp | null = null
let verified: { phone: string; until: number } | null = null

const fail = (error: string): Fail => ({ ok: false, error })

function newCode(): string {
    const n = crypto.getRandomValues(new Uint32Array(1))[0]! % 10 ** OTP_LENGTH
    return String(n).padStart(OTP_LENGTH, '0')
}

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

    /** ارسال کد پیامکی. TODO: اینجا باید به سرویس پیامک وصل بشه. */
    async function requestCode(rawPhone: string): Promise<Result<{ devCode?: string }>> {
        const invalid = validatePhone(rawPhone)
        if (invalid) return fail(invalid)
        const phone = normalizePhone(rawPhone)

        if (pending?.phone === phone) {
            const wait = Math.ceil((pending.sentAt + OTP_RESEND_SECONDS * 1000 - Date.now()) / 1000)
            if (wait > 0) return fail(`Please wait ${wait}s before requesting a new code.`)
        }

        const code = newCode()
        const now = Date.now()
        pending = { phone, code, sentAt: now, expiresAt: now + OTP_TTL_MS, attempts: 0 }
        verified = null

        if (import.meta.dev) console.info(`[auth] verification code for ${phone}: ${code}`)
        // فقط توی حالت توسعه کد برگردونده می‌شه تا بدون پیامک هم بشه تست کرد
        return { ok: true, devCode: import.meta.dev ? code : undefined }
    }

    async function verifyCode(rawPhone: string, rawCode: string): Promise<Result> {
        const phone = normalizePhone(rawPhone)
        const code = normalizeDigits(rawCode).trim()
        if (!pending || pending.phone !== phone) return fail('Request a new code first.')
        if (Date.now() > pending.expiresAt) {
            pending = null
            return fail('This code has expired. Request a new one.')
        }
        pending.attempts++
        if (code !== pending.code) {
            if (pending.attempts >= OTP_MAX_ATTEMPTS) {
                pending = null
                return fail('Too many wrong attempts. Request a new code.')
            }
            return fail('Wrong code. Try again.')
        }
        pending = null
        verified = { phone, until: Date.now() + 10 * 60 * 1000 }
        return { ok: true }
    }

    /** بعد از تأیید کد: برای کاربر جدید حساب می‌سازه، برای بقیه رمز رو عوض می‌کنه، و واردش می‌کنه */
    async function setPassword(rawPhone: string, password: string): Promise<Result<{ isNew: boolean }>> {
        const phone = normalizePhone(rawPhone)
        if (!verified || verified.phone !== phone || Date.now() > verified.until) {
            return fail('Your phone verification expired. Please start again.')
        }
        const invalid = validatePassword(password)
        if (invalid) return fail(invalid)

        try {
            const salt = randomHex()
            const passwordHash = await hashPassword(password, salt)
            const all = readUsers()
            const existing = all.find((u) => u.phone === phone)
            let id: string
            if (existing) {
                existing.salt = salt
                existing.passwordHash = passwordHash
                id = existing.id
            } else {
                id = `u${randomHex(8)}` // پیشوند: useCookie مقدارِ فقط‌عددی/علمی رو به number تبدیل می‌کنه
                all.push({ id, phone, salt, passwordHash, createdAt: new Date().toISOString(), profile: createEmptyProfile() })
            }
            save(all)
            verified = null
            session.value = id
            ready.value = true
            syncInitial()
            return { ok: true, isNew: !existing }
        } catch (e) {
            return fail(e instanceof Error ? e.message : 'Could not save your password.')
        }
    }

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
            return fail(e instanceof Error ? e.message : 'Could not log in.')
        }
        return fail('Incorrect password.')
    }

    async function updateProfile(profile: UserProfile): Promise<Result> {
        const all = readUsers()
        const found = all.find((u) => u.id === session.value)
        if (!found) return fail('You are not logged in.')
        found.profile = profile
        try {
            save(all)
        } catch {
            return fail('Could not save your profile.')
        }
        syncInitial()
        return { ok: true }
    }

    function logout() {
        session.value = null
        syncInitial()
    }

    return { user, ready, isLoggedIn, initial, lookup, requestCode, verifyCode, setPassword, login, updateProfile, logout }
}