const { fillDictionary, makeHreflang, getPermalink } = require('./utils')
const { i18nHelpers } = require('./helpers')

const defaultHooks = [
  {
    hook: 'bootstrap',
    name: 'i18nLocalesOrigin',
    description: 'Set i18n locales origin and hrefOrigin',
    priority: 100,
    run: async ({ settings, plugin }) => {
      plugin.config.locales.all.forEach((locale) => {
        const validLocale = Object.assign({}, locale, {
          prefix: '/' + (locale.prefix !== undefined ? locale.prefix : locale.iso),
          hrefOrigin: locale.origin || settings.origin,
          origin: locale.origin || ''
        })
        plugin.dictionaries.locales[locale.code] = validLocale
      })
    }
  },
  {
    hook: 'bootstrap',
    name: 'i18nHelpers',
    description: 'Set i18n helpers for route file, except generatePermalink who need i18nLocalesOrigin',
    priority: 99,
    run: async ({ helpers, settings, routes, plugin }) => {
      Object.assign(helpers, { i18n: i18nHelpers(helpers, settings, routes, plugin) })
    }
  },
  {
    hook: 'allRequests',
    name: 'i18nRequestDictionary',
    description: 'Fill i18n requests dictionary',
    priority: 99,
    run: async ({ plugin, allRequests, routes, settings, helpers }) => {
      await fillDictionary(
        plugin.dictionaries.requests,
        allRequests,
        (request) => getPermalink(request, { routes, settings, helpers }, plugin.config.permalink.lastSlash)
      )
    }
  }
]

const optionalHooks = {
  hreflang: {
    hook: 'stacks',
    name: 'i18nHreflang',
    description: 'Set i18n hreflangs',
    priority: 100,
    run: async ({ headStack, plugin, request }) => {
      const hreflangs = plugin.locales.map((locale) => {
        const origin = plugin.dictionaries.locales[locale].hrefOrigin
        const route = plugin.dictionaries.requests[locale][request.route]
        if (route === undefined) return {}
        const permalink = route[request.slug].permalink
        return makeHreflang(locale, origin + permalink)
      })
      headStack.push(...hreflangs)
    }
  },
  lang: {
    hook: 'stacks',
    name: 'i18nHtmlLang',
    description: 'Set i18n lang attribute to html tag',
    priority: 100,
    run: async ({ htmlAttributesStack, request, plugin }) => {
      const locale = plugin.config.locales.all.find((locale) => locale.code === request.locale)
      if (locale === undefined) return {}
      return {
        htmlAttributesStack: [
          ...htmlAttributesStack.filter((attr) => attr.source !== 'elderAddHtmlLangAttributes'),
          {
            source: 'i18nHtmlLang',
            priority: 100,
            string: `lang="${locale.iso}"`
          }
        ]
      }
    }
  },
  enableExcludeLocales: {
    hook: 'allRequests',
    name: 'i18nExcludeLocales',
    description: 'Remove requests according to excludeLocales config',
    priority: 90,
    run: async ({ allRequests, plugin }) => {
      return {
        allRequests: allRequests.filter((request) => !plugin.config.locales.excludes.includes(request.locale))
      }
    }
  }
}

const getOptionalHooks = (config) => {
  const keys = Object.keys(optionalHooks)
  const hooks = []
  keys.forEach((key) => {
    if (config.seo[key] === true || config[key] === true) {
      hooks.push(optionalHooks[key])
    }
  })
  return hooks
}

module.exports = { defaultHooks, getOptionalHooks }
