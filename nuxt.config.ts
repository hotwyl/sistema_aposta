export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  future: {
    compatibilityVersion: 4,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Sistema de Aposta',
      meta: [
        { name: 'description', content: 'Sistema de Aposta - Análise e gestão inteligente de apostas em loterias brasileiras. Lotofácil e Lotomania.' },
        { name: 'keywords', content: 'loteria, lotofácil, lotomania, apostas, análise, simulador, conferência' },
        { name: 'author', content: 'HOTWYL | WILLFROMBRASIL' },
        { name: 'theme-color', content: '#4f46e5' },
      ],
      link: [
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', crossorigin: 'anonymous' },
        { rel: 'dns-prefetch', href: 'https://cdnjs.cloudflare.com' },
        { rel: 'preconnect', href: 'https://cdnjs.cloudflare.com' },
      ],
    },
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/fonts',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    'nuxt-security',
    'shadcn-nuxt',
    // SEO / GEO / AEO
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],

  // ============================================
  // Tailwind CSS
  // ============================================
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  // ============================================
  // Shadcn Vue
  // ============================================
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },

  // ============================================
  // Nuxt Image
  // ============================================
  image: {
    quality: 80,
    formats: ['webp', 'avif'],
  },

  // ============================================
  // Nuxt Fonts
  // ============================================
  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
    },
  },

  // ============================================
  // i18n
  // ============================================
  i18n: {
    locales: [
      { code: 'pt-BR', name: 'Português', file: 'pt-BR.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'pt-BR',
    lazy: true,
    strategy: 'prefix_except_default',
  },

  // ============================================
  // SEO (sitemap + robots + schema-org)
  // ============================================
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'Sistema de Aposta',
    description: 'Análise e gestão inteligente de apostas em loterias brasileiras (Lotofácil e Lotomania).',
    defaultLocale: 'pt-BR',
  },

  // Robots (SEO): indexação liberada, bloqueia apenas rotas internas.
  robots: {
    disallow: ['/api/'],
  },

  // Sitemap (SEO): gerado automaticamente a partir das rotas.
  sitemap: {
    autoLastmod: true,
  },



  // ============================================
  // Nuxt Security
  // ============================================
  security: {
    strict: false,
    headers: {
      crossOriginEmbedderPolicy: 'unsafe-none',
      contentSecurityPolicy: {
        'base-uri': ["'none'"],
        'default-src': ["'self'"],
        'connect-src': ["'self'"],
        'font-src': ["'self'", 'https://cdnjs.cloudflare.com', 'data:'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'object-src': ["'none'"],
        'script-src': ["'self'", "'unsafe-inline'", "'nonce-{{nonce}}'", 'https://cdnjs.cloudflare.com'],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
        'upgrade-insecure-requests': process.env.NODE_ENV === 'production',
      },
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
        usb: [],
      },
      referrerPolicy: 'strict-origin-when-cross-origin',
      xContentTypeOptions: 'nosniff',
      xFrameOptions: 'SAMEORIGIN',
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubdomains: true,
        preload: true,
      },
    },
    // Rate limit em memória (por instância). Em cluster, o storage 'queue'
    // do Redis pode ser usado por um limitador dedicado, se necessário.
    rateLimiter: {
      tokensPerInterval: 100,
      interval: 60000,
    },
    // Bloqueia payloads gigantes na borda (o middleware sanitize.ts refina por rota).
    requestSizeLimiter: {
      maxRequestSizeInBytes: 16 * 1024 * 1024,
      maxUploadFileRequestInBytes: 16 * 1024 * 1024,
    },
    xssValidator: false,
  },

  // ============================================
  // Runtime Config
  // ============================================
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/sistema_aposta',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    sentryDsn: process.env.SENTRY_DSN || '',
    // IA Gateway - 9Router (OpenAI-compatible)
    nineRouterUrl: process.env.NINEROUTER_URL || 'http://localhost:20128',
    nineRouterApiKey: process.env.NINEROUTER_API_KEY || '',
    nineRouterModel: process.env.NINEROUTER_MODEL || 'auto/best',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || '587',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    public: {
      appName: 'Sistema de Aposta',
      appVersion: '1.0.0',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },

  // ============================================
  // Nitro (Server Engine)
  // ============================================
  nitro: {
    compressPublicAssets: true,
    minify: true,
    externals: {
      inline: ['xlsx', 'mysql2'],
    },
    // Storage (Redis) para cache/jobs é montado em RUNTIME por
    // server/plugins/storage.ts (lê REDIS_URL do runtimeConfig).
    routeRules: {
      '/api/**': {
        cors: false,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      },
      '/_nuxt/**': {
        headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      },
    },
  },

  // ============================================
  // TypeScript
  // ============================================
  typescript: {
    strict: true,
  },

  // ============================================
  // Experimental
  // ============================================
  experimental: {
    renderJsonPayloads: false,
  },

  devtools: { enabled: true },
})
