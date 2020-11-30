# Elder.js Plugin: i18n

i18n (internationalization) for elderjs.

## Status: WIP
You can use it right now but some features will not work until [PR#97](https://github.com/Elderjs/elderjs/pull/97) is merged.

### TODO
- [ ] Documentation
- [ ] More examples
- [ ] `svelte-i18n` integration

## Current issues
- [ ] html lang attribute (waiting for [PR#97](https://github.com/Elderjs/elderjs/pull/97))
- [ ] `locales: { excludes: [] }` option will break `allPermalinks` helpers

## Features
- 0kb js in the build ( or integration with `svelte-i18n` soon ).
- Automatic routes generation and custom paths.
- Search engine optimisation.
- Support language (in ISO 639-1 format) and optionally a region (in ISO 3166-1 Alpha 2 format).
- Access permalink/routes for alternative locales.

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
{ code: 'en', iso: 'en', origin: 'https://different-origin.uk' }
```
- `code`: your local code. It's used as an id, prefix for permalink.
- `iso`: your iso code, e.g: `en` or `en-GB`.
- `origin (optional)`: If your website use different domains (or subdomains), you can specify an other origin here.

`all`: An array containing all your locales as define previously.
You can also use a simple string as a shortcut, e.g: `'fr'` become `{ code: 'fr', iso: 'fr'}` .
`default`: The default locale code.
`excludes`: An array of locale code to excludes from generation, but keeping the links. Can be used in the case of internationalization with multiples domains.

### Permalink
Options 
  `prefix`: add the corresponding locale locale before the permalink. e.g: `/example` with `{code: 'en'}` locale will become `/en/example`.
  `defaultPrefix`: if the default locale should have a prefix or not.

### Seo
`hreflang`: Generate hreflang links into the head of your document.
`lang`: Add the `lang` attribute with th corresponding locale to your body.

## Helpers
This plugin come with somes helpers define in `helpers.i18n` accessible in your `route.js` file. These helpers can be describe in two categories:
### Generation
They generate the new routes according to the plugins options. They have to be used in your `route.js` for the pages you want to internationalize.
- `generateRequests([request]) : [request]`: generate requests for each locales. It will add an `lang` attributes.
- `generatePermalink(permalink, locale): permalink`: generate permalink according to plugins options and a given locale.
### Access
- `permalink(request) : permalink`: act as the default permalink helpers
- `allPermalinks({route, slug}) : [permalink]` get permalinks for each locales

## Example

