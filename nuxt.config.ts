// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/image', '@nuxt/ui', 'nuxt-mongoose', '@pinia/nuxt', 'nuxt-quasar-ui'],
  css: ['~/assets/css/main.css'],
  mongoose: {
    uri: process.env.MONGODB_URI,
    options: {},
    modelsDir: 'models',
  },
  runtimeConfig: {
    mailUserQ: process.env.QTECH_MAIL_USER,
    mailPasswordQ: process.env.QTECH_MAIL_PASSWORD,
    devMode: process.env.NODE_ENV !== 'production',
    public: {
      devMode: process.env.NODE_ENV !== 'production',
      authExpiration: 3600 * 24 * 30,
      authRefreshBeforeExpiration: 3000,
      authTokenName: 'auth_token',
    }
  },
  quasar: {
    sassVariables: '~~/public/quazar.variables.sass',
    components: {
      defaults: {
        QCard:{
          flat: true,
          bordered: true
        },
        QBtn: {
          dense: true,
          flat: true,
          noCaps: true
        },
        QSelect: {
          outlined: true,
          dense: true
        },
        QInput: {
          outlined: true,
          dense: true
        }
      }
    },
    iconSet: 'mdi-v7',
    lang: 'ru'

  },
  nitro: {
    storage: {
      chassis: {
        driver: "fs",
        base: "./upload/chassis",
      },
      excel: {
        driver: "fs",
        base: "./upload/excel",
      },
    },
  },

})