// صفحه‌هایی که ورود می‌خوان: definePageMeta({ middleware: 'auth' })
export default defineNuxtRouteMiddleware((to) => {
    const session = useSessionCookie()
    if (!session.value) {
        return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
    }
})