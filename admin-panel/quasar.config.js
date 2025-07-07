// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers'

export default defineConfig((/* ctx */) => {
  return {
    boot: [
      'axios'
    ],

    css: [
      'app.scss'
    ],

    extras: [
      'roboto-font',
      'material-icons',
    ],

    build: {
      target: {
        browser: [ 'es2022', 'firefox115', 'chrome115', 'safari14' ],
        node: 'node20'
      },

      vueRouterMode: 'history',

      vitePlugins: [
        ['vite-plugin-checker', {
          eslint: {
            lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
            useFlatConfig: true
          }
        }, { server: false }]
      ],

      extendViteConf (viteConf) {
        viteConf.server = {
          ...viteConf.server,
          host: true,
          origin: 'https://painel-admin-demoteste.guthsolutions.com.br',
        }
      }
    },

    devServer: {
      open: true
    },

    framework: {
      config: {},
      plugins: [
        'Notify',
        'Loading',
        'Dialog'
      ]
    },

    animations: [],

    ssr: {
      prodPort: 3000,
      middlewares: [
        'render'
      ],
      pwa: false
    },

    pwa: {
      workboxMode: 'GenerateSW'
    },

    cordova: {},

    capacitor: {
      hideSplashscreen: true
    },

    electron: {
      preloadScripts: [ 'electron-preload' ],
      inspectPort: 5858,
      bundler: 'packager',
      builder: {
        appId: 'barbearia-frontend'
      }
    },

    bex: {
      extraScripts: []
    }
  }
})
