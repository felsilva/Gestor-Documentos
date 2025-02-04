// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
  ],
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Gestor de documentos',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  devtools: { enabled: false },
  compatibilityDate: '2025-02-04',

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      exclude: ['/'],
    }
  },

  components: {
    global: true,
    dirs: ['~/components']
  },

  // Configuración para el manejo de errores y logs
  typescript: {
    strict: true
  },

  nitro: {
    serveStatic: true,
  },

  // Configuración para el manejo de transiciones
  experimental: {
    payloadExtraction: false
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => [
        'transition-group',
        'category-select',
        'tag-input',
        'document-table',
        'TransitionRoot',
        'TransitionChild',
        'Dialog',
        'DialogPanel',
        'DialogTitle'
      ].includes(tag.toLowerCase())
    }
  },

  runtimeConfig: {
    b2KeyId: process.env.B2_KEY_ID,
    b2ApplicationKey: process.env.B2_APPLICATION_KEY,
    b2BucketId: process.env.B2_BUCKET_ID,
    b2BucketName: process.env.B2_BUCKET_NAME,
    b2Endpoint: process.env.B2_ENDPOINT,
    public: {
      // Configuración pública aquí
    }
  }
})
