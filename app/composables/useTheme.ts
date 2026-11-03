export const THEMES = ['navy', 'dark', 'wine', 'light'] as const

export type Theme = (typeof THEMES)[number]

const isTheme = (v: unknown): v is Theme => (THEMES as readonly unknown[]).includes(v)

export function useTheme() {
    const cookie = useCookie<Theme>('piano-theme', {
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        default: () => 'dark',
    })

    const theme = useState<Theme>('theme', () => (isTheme(cookie.value) ? cookie.value : 'dark'))
    const isLight = computed(() => theme.value === 'light')

    function setTheme(next: Theme) {
        if (!isTheme(next)) return
        theme.value = next
        cookie.value = next
    }

    function toggle() {
        setTheme(isLight.value ? 'dark' : 'light')
    }

    return { theme, isLight, setTheme, toggle }
}
