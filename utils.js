//
// HEAD
//

const makeHreflang = (locale, url) => {
  const hreflang = `<link data-hid="alternate-hreflang-${locale}" rel="alternate" href="${url}" hreflang="${locale}">`
  return {
    source: 'i18nHref',
    priority: 100,
    string: hreflang
  }
}

//
// Dictionnaries
//

const fillDictionary = async (dictionary, allRequests, getExtraData) => {
  const getData = getExtraData
    ? async (request) => {
        const extra = await getExtraData(request)
        return Object.assign({}, request, extra)
      }
    : async (request) => request
  return allRequests.forEach(async (request) => {
    if (request.locale === undefined) return
    if (dictionary[request.locale] === undefined) {
      console.error(`Error: i18n: ${request.locale} locale is not defined in i18n config`)
      return
    }
    const data = await getData(request)
    if (dictionary[request.locale][request.route] === undefined) {
      dictionary[request.locale][request.route] = {}
    }
    dictionary[request.locale][request.route][request.slug] = data
  })
}
//
// Set permalinks to request, based on elderjs code
// Basically a copy of src/Elder.ts way, but with a refacto to match my taste
// Need createReadOnlyProxy implementation

const createReadOnlyProxy = (obj, objName, location) => {
  try {
    if (typeof obj !== 'object' && !Array.isArray(obj)) return obj
    return new Proxy(obj, {
      set () {
        console.log(
          `Object ${objName} is not mutable from ${location}. Check the error below for the hook/plugin that is attempting to mutate properties outside of the rules in hookInterface.ts or in other restricted areas.`
        )
        return false
      }
    })
  } catch (e) {
    return obj
  }
}

const getPermalink = async (request, { routes, settings, helpers }) => {
  if (!routes[request.route] || !routes[request.route].permalink) {
    const msg = request.route
      ? 'Request missing permalink but has request.route defined. This shouldn\'t be an Elder.js issue but if you believe it could be please create an issue.'
      : 'Request is missing a \'route\' key. This usually happens when request objects have been added to the allRequests array via a hook or plugin.'
    console.error(`${msg} ${JSON.stringify(request)}`)
  }
  const permalink = await routes[request.route].permalink({
    request,
    settings: createReadOnlyProxy(settings, 'settings', `${request.route} permalink function`),
    helpers: createReadOnlyProxy(helpers, 'helpers', `${request.route} permalink function`)
  })
  return {
    permalink: (settings && settings.server && settings.server.prefix)
      ? settings.server.prefix + permalink
      : permalink
  }
}

module.exports = { fillDictionary, fillDictionaryWithCopy, makeHreflang, getPermalink }
