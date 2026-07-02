import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'SnapCraft — Screenshot & Screen Recorder',
    description: 'Capture screenshots, record your screen, and annotate with a powerful built-in editor.',
    version: '1.0.0',
    action: {
      default_icon: {
        16: 'icon/16.png',
        48: 'icon/48.png',
        128: 'icon/128.png',
      },
    },
    icons: {
      16: 'icon/16.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
    permissions: [
      'activeTab',
      'tabs',
      'scripting',
      'storage',
      'offscreen',
      'tabCapture',
      'desktopCapture',
      'downloads',
      'notifications',
    ],
    host_permissions: ['<all_urls>'],
    commands: {
      'capture-visible': {
        suggested_key: {
          default: 'Alt+Shift+V',
        },
        description: 'Capture visible area',
      },
      'capture-fullpage': {
        suggested_key: {
          default: 'Alt+Shift+F',
        },
        description: 'Capture full page',
      },
      'capture-region': {
        suggested_key: {
          default: 'Alt+Shift+S',
        },
        description: 'Capture selected region',
      },
      'record-tab': {
        suggested_key: {
          default: 'Alt+Shift+R',
        },
        description: 'Record current tab',
      },
    },
    web_accessible_resources: [
      {
        resources: ['icon/*', '*.html'],
        matches: ['<all_urls>'],
      },
    ],
  },
  vite: () => ({
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  }),
});
