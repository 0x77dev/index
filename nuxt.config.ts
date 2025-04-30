// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '@nuxt/content',
    'nuxt-og-image',
    '@nuxtjs/seo',
    'nuxt-llms'
  ],

  $production: {
    content: {
      database: {
        type: 'd1',
        bindingName: 'CONTENT'
      }
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: 'https://index.0x77.dev'
  },

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1
        }
      }
    }
  },

  future: {
    compatibilityVersion: 4
  },

  experimental: {
    viewTransition: true,
    watcher: 'parcel',
    payloadExtraction: true
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    experimental: {
      openAPI: true
    },
    openAPI: {
      meta: {
        title: 'Index API',
        description: 'The API for the Index',
        version: '0.0.0'
      },
      production: 'prerender',
      route: '/api/openapi.json',
      ui: {
        scalar: {
          route: '/api/docs'
        }
      }
    },
    prerender: {
      routes: [
        '/'
      ],
      failOnError: false,
      autoSubfolderIndex: false,
      crawlLinks: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    provider: 'iconify'
  },

  llms: {
    domain: 'https://index.0x77.dev',
    title: 'Index',
    description: 'A personal knowledge repository built with modern tech.',
    full: {
      title: 'Index - Full Knowledge Base',
      description: 'This is the full knowledge base for the Index'
    },
    sections: [
      {
        title: 'Index',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/%' }
        ]
      }
    ]
  },

  ogImage: {
    zeroRuntime: true
  }
})
