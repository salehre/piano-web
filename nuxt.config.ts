import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n', '@vite-pwa/nuxt'],
  // فونت فارسی (روی خود پروژه نصب می‌شه، نیازی به گوگل‌فونت نیست)
  css: ['@fontsource-variable/vazirmatn', '~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  // lang و dir و title از app.vue و بر اساس زبان فعلی ست می‌شن (اینجا title ثابت نذار)

  app: {
    head: {
      meta: [
        { name: 'theme-color', content: '#170701' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'وب پیانو' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        // ?v=N باعث می‌شه مرورگر آیکون قدیمی کش‌شده رو دور بندازه؛ هر بار آیکون رو عوض کردی N رو بالا ببر
        { rel: 'icon', href: '/favicon.ico?v=3', sizes: '48x48' },
        { rel: 'icon', type: 'image/png', href: '/icons/favicon-32.png?v=3', sizes: '32x32' },
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg?v=3', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png?v=3' },
      ],
    },
  },

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

  // وب‌اپ (PWA)
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      id: '/',
      name: 'وب پیانو',
      short_name: 'وب پیانو',
      description: 'پیانوی مجازی آنلاین؛ با کیبورد، موس، لمس یا MIDI بنواز',
      theme_color: '#170701',
      background_color: '#170701',
      display: 'standalone',
      orientation: 'any',
      start_url: '/',
      scope: '/',
      lang: 'fa',
      dir: 'rtl',
      categories: ['music', 'entertainment'],
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
      shortcuts: [
        {
          name: 'پیانوی مجازی',
          short_name: 'پیانو',
          url: '/virtual-piano',
          icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
      // برنامه SSR هست و index.html نداره؛ صفحه‌ها موقع اولین بازدید کش می‌شن (NetworkFirst)
      navigateFallback: null,
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages',
            networkTimeoutSeconds: 4,
            expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
        {
          urlPattern: ({ request }: { request: Request }) =>
            ['font', 'audio'].includes(request.destination),
          handler: 'CacheFirst',
          options: {
            cacheName: 'assets',
            expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 60 },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
    },
  },
})