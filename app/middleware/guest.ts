export default defineNuxtRouteMiddleware(() => {
    const session = useSessionCookie()
    if (session.value) return navigateTo('/profile')
})