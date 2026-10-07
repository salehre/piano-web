export type Theme = 'dark' | 'light'

/** تم سایت؛ توی کوکی می‌مونه تا SSR از همون اول تم درست رو رندر کنه */
export function useTheme() {
    const cookie = useCookie<Theme>('piano-theme', {
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        default: () => 'dark',
    })

    const theme = useState<Theme>('theme', () => (cookie.value === 'light' ? 'light' : 'dark'))
    const isLight = computed(() => theme.value === 'light')

    function setTheme(next: Theme) {
        theme.value = next
        cookie.value = next
    }

    function toggle() {
        setTheme(isLight.value ? 'dark' : 'light')
    }

    return { theme, isLight, setTheme, toggle }
}
