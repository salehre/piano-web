// صفحه‌هایی مثل لاگین و ثبت‌نام که کاربرِ واردشده نباید ببینه
export default defineNuxtRouteMiddleware(() => {
    const session = useSessionCookie()
    if (session.value) return navigateTo('/profile')
})