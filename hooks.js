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
    priority: 100,
    run: async ({ plugin, allRequests, routes, settings, helpers }) => {
      // If we exclude locales, we want a copy with permalink to not break permalink calls
      if (plugin.config.enableExcludeLocales) {
        await fillDictionary(
          plugin.dictionaries.requests,
          allRequests,
          (request) => getPermalink(request, { routes, settings, helpers })
        )
      } else {
        await fillDictionary(plugin.dictionaries.requests, allRequests)
      }
    }
  }
]
const { clients, clientOptions, fillClientDictionary } = require('./clients/index')

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
  },
  client: [{
    hook: 'bootstrap',
    name: 'i18nAddClient',
    description: 'add client to plugin with its options, according to elder.config',
    priority: 100,
    run: async ({ plugin }) => {
      const client = clients[plugin.settings.client.name]
      if (client === undefined) {
        console.error(`I18n Error: client with name: ${plugin.settings.client.name} is not available.`)
        return
      }
      const options = clientOptions(client, plugin.settings.locale.defaultLocale, plugin.settings.client)
      plugin.clientSide = { client, options }
    }
  },
  {
    hook: 'data',
    name: 'i18nClientFillData',
    description: 'add data added by `addData` helper to i18nClient from, dictionaries.data',
    priority: 100,
    run: async ({ request, plugin }) => {
      plugin.clientSide.client.addEntry(request.lang, plugin.dictionaries.data[request.lang])
    }
  },
  {
    hook: 'data',
    name: 'i18nClientInit',
    description: 'initialise i18n Client',
    priority: 99,
    run: async ({ plugin }) => {
      plugin.clientSide.client.init(plugin.clientSide.options)
    }
  }

  ]
}

const getOptionalHooks = (config) => {
  const keys = Object.keys(optionalHooks)
  const hooks = []
  keys.forEach((key) => {
    if (config.seo[key] === true || config[key] === true) {
      const newHook = optionalHooks[key]
      if (Array.isArray(newHook)) {
        hooks.push(...newHook)
      } else {
        hooks.push(newHook)
      }
    }
  })
  return hooks
}

module.exports = { defaultHooks, getOptionalHooks }
