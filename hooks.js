const { fillDictionary, makeHreflang } = require('./utils');
const { i18nHelpers } = require('./helpers');

const defaultHooks = [
  {
    hook: 'bootstrap',
    name: 'i18nLocalesOrigin',
    description: 'Set i18n locales origin and hrefOrigin',
    priority: 100,
    run: async ({ settings, plugin }) => {
      plugin.config.locales.forEach((locale) => {
        const newLocale = Object.assign({}, locale);
        newLocale.prefix = '/' + (locale.prefix !== undefined ? locale.prefix : locale.iso);
        newLocale.hrefOrigin = locale.origin || settings.origin;
        if (newLocale.origin === undefined) {
          newLocale.origin = '';
        }
        plugin.dictionaries.locales[locale.code] = newLocale;
      });
    },
  },
  {
    hook: 'bootstrap',
    name: 'i18nHelpers',
    description: 'Set i18n helpers for route file, except generatePermalink who need i18nLocalesOrigin',
    priority: 99,
    run: async ({ helpers, settings, routes, plugin }) => {
      Object.assign(helpers, { i18n: i18nHelpers(helpers, settings, routes, plugin) });
    },
  },
  {
    hook: 'allRequests',
    name: 'i18nRequestDictionary',
    description: 'Fill i18n requests dictionary',
    priority: 100,
    run: async ({ plugin, allRequests }) => {
      fillDictionary(plugin.dictionaries.requests, allRequests);
    },
  },
];

const optionalHooks = {
  hreflang: {
    hook: 'stacks',
    name: 'i18nHreflang',
    description: 'Set i18n hreflangs',
    priority: 100,
    run: async ({ headStack, plugin, request }) => {
      const hreflangs = plugin.locales.map((locale) => {
        const origin = plugin.dictionaries.locales[locale].hrefOrigin;
        const route = plugin.dictionaries.requests[locale][request.route];
        if (route === undefined) return {};
        const permalink = route[request.slug].permalink;
        return makeHreflang(locale, origin + permalink);
      });
      headStack.push(...hreflangs);
    },
  },
  lang: {
    hook: 'stacks',
    name: 'i18nHtmlLang',
    description: 'Set i18n lang attribute to html tag',
    priority: 100,
    run: async ({ htmlAttributesStack, request, plugin }) => {
      const locale = plugin.config.locales.find((locale) => locale.code === request.locale);
      if (locale === undefined) return {};
      return {
        htmlAttributesStack: [
          ...htmlAttributesStack.filter((attr) => attr.source !== 'elderAddHtmlLangAttributes'),
          {
            source: 'i18nHtmlLang',
            priority: 100,
            string: `lang="${locale.iso}"`,
          },
        ],
      };
    },
  },
  enableExcludeLocales: {
    hook: 'allRequests',
    name: 'i18nExcludeLocales',
    description: 'Remove requests according to excludeLocales config',
    priority: 90,
    run: async ({ allRequests, plugin }) => {
      return {
        allRequests: allRequests.filter((request) => !plugin.config.excludeLocales.includes(request.locale)),
      };
    },
  },
};

const getOptionalHooks = (config) => {
  const keys = Object.keys(optionalHooks);
  const hooks = [];
  keys.forEach((key) => {
    if (config[key] === true) {
      hooks.push(optionalHooks[key]);
    }
  });
  return hooks;
};

module.exports = { defaultHooks, getOptionalHooks };
