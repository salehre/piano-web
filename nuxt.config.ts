import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n'],
  // فونت فارسی (روی خود پروژه نصب می‌شه، نیازی به گوگل‌فونت نیست)
  css: ['@fontsource-variable/vazirmatn', '~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  // lang و dir و title از app.vue و بر اساس زبان فعلی ست می‌شن (اینجا title ثابت نذار)

  i18n: {
    locales: [
      { code: 'fa', language: 'fa-IR', dir: 'rtl', name: 'فا', file: 'fa.json' },
      { code: 'en', language: 'en-US', dir: 'ltr', name: 'EN', file: 'en.json' },
    ],
    // نسبت به i18n/ (restructureDir پیش‌فرض ماژول) => فایل‌ها از i18n/locales/** خونده می‌شن
    langDir: 'locales',
    defaultLocale: 'fa',
    strategy: 'no_prefix',
    // زبان انتخاب‌شده توی کوکی می‌مونه؛ چون سرور هم کوکی رو می‌خونه، SSR از همون اول درست رندر می‌شه
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'piano-locale',
      fallbackLocale: 'fa',
    },
    // تنظیمات vue-i18n (فرمت تاریخ و عدد، زبان جایگزین) توی i18n/i18n.config.ts
  },

    pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Todolist",
      short_name: "Todolist",
      description: "اپلیکیشن مدیریت کارها",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
      lang: "fa",
      dir: "rtl",
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
    },
    devOptions: {
      enabled: false,
    },
  },
  
})
