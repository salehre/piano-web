/** کوکی نشست؛ شناسه‌ی کاربرِ واردشده توش ذخیره می‌شه (null یعنی وارد نشده) */
export function useSessionCookie() {
    return useCookie<string | null>(SESSION_COOKIE, {
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        default: () => null,
    })
}