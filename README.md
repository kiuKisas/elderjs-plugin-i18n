# Elder.js Plugin: i18n
[![npm version](https://badge.fury.io/js/elderjs-plugin-i18n.svg)](https://badge.fury.io/js/elderjs-plugin-i18n)

i18n (internationalization) for [elderjs](https://github.com/Elderjs/elderjs/).
You will need `elderjs v1.2.5` or higher.

## Features
- [x] 0kb js in the build.
- [x] Automatic routes generation and custom paths.
- [x] Search engine optimisation.
- [x] Support language (in ISO 639-1 format) and optionally a region (in ISO 3166-1 Alpha 2 format).
- [x] Access permalink/routes for alternative locales.
- [ ] integration with `svelte-i18n` ( [PR#3](https://github.com/kiuKisas/elderjs-plugin-i18n/pull/3) )
- [ ] Redirection

## TODO
- [ ] site example
- [ ] Better documentation
- [ ] More examples

## Install

```bash
npm i -s elderjs-plugin-i18n # or yarn add elderjs-plugin-i18n
```

## Config

Once installed, open your `elder.config.js` and configure the plugin by adding 'elder-plugin-i18n' to your plugin object.

```javascript
plugins: {
  'elderjs-plugin-i18n': {
      locales: {
        default: 'fr',
        all: ['fr', { code: 'en', iso: 'en' }],
        excludes: ['en'],
      },
      permalink: {
        prefix: true,
        prefixDefault: false,
      },
      seo: {
        hreflang: true,
        lang: true,
      }
  },

}
```

### Locales
A locale in this plugin is defined like this:
```
{
  code: 'en', // your local code. It's used as an id and prefix for permalink.
  iso: 'en', // your iso code, e.g: `en` or `en-GB`.
  origin: 'https://different-origin.uk' // ( Optional ). Set a diffent domains/subdomains.
  }
```
In the configuration:
`all`: An array containing all your locales as define previously.

You can also use a simple string as a shortcut, e.g: `'fr'` become `{ code: 'fr', iso: 'fr'}` .

`default`: The default locale code.

`excludes`: An array of locale code to excludes from generation, but keeping the links. Can be used in the case of internationalization with multiples domains.

### Permalink
`prefix`: add the corresponding locale locale before the permalink. e.g: `/example` with `{code: 'en'}` locale will become `/en/example`.

`defaultPrefix`: if the default locale should have a prefix or not.

### Seo
`hreflang`: Generate hreflang links into the head of your document.

`lang`: Add the `lang` attribute with th corresponding locale to your body.

## Helpers
This plugin come with somes helpers define in `helpers.i18n` accessible in your `route.js` file. These helpers can be describe in two categories:
### Generation
They generate the new routes according to the plugins options. They have to be used in your `route.js` for the pages you want to internationalize.
- `generateRequests([request]) : [request]`: generate requests for each locales. It will add a `locale` attributes.
- `generatePermalink(permalink, locale): permalink`: generate permalink according to plugins options and a given locale.
### Access
- `permalink(request) : permalink`: act as the default permalink helpers
- `allPermalinks({route, slug}) : [permalink]` get permalinks for each locales

## Example

```javascript
// route.js

module.exports = {
  all: async ({ helpers }) => helpers.i18n.generateRequests([{slug: 'example'}]), // [{slug: 'example', locale: 'en'}, ...]
  permalink: ({ request, helpers }) => helpers.i18n.generatePermalink(request.slug, request.locale), // '/en/example'
  data: async ({ helpers, request }) => { links: helpers.i18n.allPermalinks(request), }, // [{ locale: 'en', permalink: '/en/example' }, ...]
  }
```
