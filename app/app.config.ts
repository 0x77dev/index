import type { GiscusProps } from '@giscus/vue'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'black',
      neutral: 'zinc'
    }
  },
  giscus: {
    repo: '0x77dev/index' as `${string}/${string}`,
    repoId: 'R_kgDOOihOwQ',
    category: 'General',
    categoryId: 'DIC_kwDOOihOwc4Cpx6e',
    mapping: 'pathname',
    strict: '0',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'top',
    theme: 'preferred_color_scheme',
    lang: 'en',
    reactions: '1',
    loading: 'lazy'
  } as GiscusProps,
  uiPro: {
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted'
      }
    },
    prose: {
      codeIcon: {
        terminal: 'i-ph-terminal-window-duotone',
        conf: 'i-ph-file-code-duotone',
        envrc: 'i-ph-terminal'
      }
    }
  },
  seo: {
    siteName: 'Index'
  },
  header: {
    title: '^~~~^~~~',
    to: '/',
    logo: {
      alt: 'Index Logo',
      light: '/favicon.svg',
      dark: '/favicon.svg'
    },
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-ph-chart-bar-duotone',
      'to': 'https://plausible.io/index.0x77.dev',
      'target': '_blank',
      'aria-label': 'Stats'
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/0x77dev/index',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  footer: {
    credits: 'Mykhailo Marynenko <ping [at] 0x77 [dot] dev>',
    colorMode: false,
    links: [{
      'icon': 'i-ph-chart-bar-duotone',
      'to': 'https://plausible.io/index.0x77.dev',
      'target': '_blank',
      'aria-label': 'Stats'
    }, {
      'icon': 'i-ph-globe',
      'to': 'https://0x77.dev',
      'target': '_blank',
      'aria-label': 'Website'
    }, {
      'icon': 'i-simple-icons-x',
      'to': 'https://x.com/0x77dev',
      'target': '_blank',
      'aria-label': 'X'
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/0x77dev/index',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  toc: {
    title: 'Table of Contents',
    bottom: {
      title: 'Additional Resources',
      links: [{
        icon: 'i-ph-brain',
        label: 'llms.txt',
        to: 'https://index.0x77.dev/llms.txt',
        target: '_blank'
      }]
    }
  }
})
