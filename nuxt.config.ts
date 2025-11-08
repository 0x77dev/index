// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-og-image',
    '@nuxtjs/seo',
    'nuxt-llms',
    '@nuxtjs/plausible',
    '@nuxthub/core'
  ],

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
        },
        highlight: {
          langs: ['bash', 'docker', 'json', 'markdown', 'nix', 'python', 'rust', 'toml', 'yaml', 'nix', 'mermaid']
        }
      }
    }
  },

  future: {
    compatibilityVersion: 4
  },

  experimental: {
    viewTransition: true,
    payloadExtraction: true
  },

  compatibilityDate: '2025-11-07',

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    },
    rollupConfig: {
      external: ['readdirp', 'picomatch']
    },
    experimental: {
      openAPI: true
    },
    openAPI: {
      meta: {
        title: 'Index API',
        description: 'API for the index.0x77.dev',
        version: '0.0.0'
      }
    }
  },

  hub: {
    ai: true,
    analytics: true,
    cache: true,
    database: true,
    kv: true,
    bindings: {
      observability: {
        logs: true
      }
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

  image: {
    provider: 'cloudflare',
    cloudflare: {
      baseURL: 'https://index.0x77.dev'
    }
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
    // Use Satori for rendering (lightweight, no chromium needed)
    defaults: {
      renderer: 'satori',
      // Cache for 7 days
      cacheMaxAgeSeconds: 60 * 60 * 24 * 7
    },
    // Use NuxtHub's built-in cache
    runtimeCacheStorage: true
  },

  plausible: {
    ignoredHostnames: ['localhost'],
    autoOutboundTracking: true,
    proxy: true
  },

  sitemap: {
    exclude: [/^\/api\/.*/, /^\/_.*$/]
  }
})
