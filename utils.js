//
// HEAD
//

const makeHreflang = (locale, url) => {
  const hreflang = `<link data-hid="alternate-hreflang-${locale}" rel="alternate" href="${url}" hreflang="${locale}">`;
  return {
    source: 'i18nHref',
    priority: 100,
    string: hreflang,
  };
};

//
// Dictionnaries
//

const fillDictionary = (dictionary, allRequests) => {
  allRequests.forEach((request) => {
    if (request.locale === undefined) return;
    if (dictionary[request.locale] === undefined) {
      console.error('Error: i18n: ${request.locale} locale is not defined in i18n config');
      return;
    }
    const dicoRoute = dictionary[request.locale][request.route] || {};
    dicoRoute[request.slug] = request;
    dictionary[request.locale][request.route] = dicoRoute;
  });
};

module.exports = { fillDictionary, makeHreflang };
