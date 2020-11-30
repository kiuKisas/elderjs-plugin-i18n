// Fix permalink helpers with access to helpers
const i18nPermalinks = (routes, settings, helpers) =>
  Object.keys(routes).reduce((out, cv) => {
    const prefix = settings.server && settings.server.prefix ? settings.server.prefix : '';
    out[cv] = (data) => `${prefix}${routes[cv].permalink({ request: data, settings, helpers })}`;
    return out;
  }, {});

const generatePermalink = ({ prefix, prefixDefault }, locales, defaultLocale) => {
  // Don't touch permalink
  if (!prefix) return (permalink) => permalink;
  const createi18nPermalink = (permalink, locale) => {
    return `${locales[locale].prefix}${permalink}`;
  };
  // prefix for every locales
  if (prefixDefault) return createi18nPermalink;
  // prefix for every locales except the default one
  return (permalink, locale) => (locale === defaultLocale ? permalink : createi18nPermalink(permalink, locale));
};

const i18nHelpers = (helpers, settings, routes, plugin) => {
  return {
    generateRequests: (reqs) => {
      const requests = [];
      reqs.forEach((req) => {
        plugin.config.locales.all.forEach((locale) => {
          //if (plugin.config.excludeLocales.includes(locale.code)) return;
          requests.push(Object.assign({}, req, { locale: locale.code }));
        });
      });
      return requests;
    },
    generatePermalink: generatePermalink(
      plugin.config.permalink,
      plugin.dictionaries.locales,
      plugin.config.locales.default,
    ),
    permalinks: i18nPermalinks(routes, settings, helpers),
    allPermalinks: ({ route, slug }) => {
      const isI18nRoute = plugin.dictionaries.requests[plugin.config.locales.default][route] !== undefined;
      if (!isI18nRoute) return [];
      return plugin.locales.map((locale) => {
        const origin = plugin.dictionaries.locales[locale].origin;
        return {
          locale: locale,
          permalink: origin + plugin.dictionaries.requests[locale][route][slug].permalink,
        };
      });
    },
    dictionaries: plugin.dictionaries,
    locales: () => plugin.locales,
  };
};

module.exports = { i18nHelpers };
