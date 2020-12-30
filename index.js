const { defaultHooks, getOptionalHooks } = require('./hooks')

const plugin = {
  name: 'elderjs-plugin-i18n',
  description: 'i18n support for elderjs',
  init: (plugin) => {
    plugin.config.enableExcludeLocales = plugin.config.locales.excludes.length > 0
    plugin.hooks = [plugin.hooks, getOptionalHooks(plugin.config)].flat()
    plugin.config.locales.all = plugin.config.locales.all.map((locale) =>
      typeof locale === 'string' ? { code: locale, iso: locale } : locale
    )
    const locales = plugin.config.locales.all.map((locale) => locale.code)
    const dictionaryTemplate = locales.reduce((o, key) => ({ ...o, [key]: {} }), {})
    return Object.assign(plugin, {
      locales,
      dictionaries: {
        requests: dictionaryTemplate,
        locales: Object.assign({}, dictionaryTemplate),
        data: Object.assign({}, dictionaryTemplate)
      }
    })
  },
  hooks: defaultHooks,
  config: {
    locales: {
      default: 'en',
      all: ['en'],
      excludes: []
    },
    permalink: {
      prefix: true,
      prefixDefault: true
    },
    seo: {
      hreflang: true,
      lang: true
    },
    client: {
      name: 'svelte-i18n',
      config: {
        initialLocale: 'navigator',
        fallback: 'default'
      },
      options: {}
    }
  }
}

module.exports = plugin
