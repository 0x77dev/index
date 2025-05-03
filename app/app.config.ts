export default defineAppConfig({
  ui: {
    colors: {
      primary: 'black',
      neutral: 'zinc'
    }
  },
  uiPro: {
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted'
      }
    }
  },
  seo: {
    siteName: 'Index - Mykhailo Marynenko'
  },
  header: {
    title: '',
    to: '/',
    logo: {
      alt: '',
      light: '',
      dark: ''
    },
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-ph-globe',
      'to': 'https://0x77.dev',
      'target': '_blank',
      'aria-label': '0x77.dev'
    }]
  },
  footer: {
    credits: "Mykhailo Marynenko <ping [at] 0x77 [dot] dev>",
    colorMode: false,
    links: [{
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
      'to': 'https://github.com/0x77dev',
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
