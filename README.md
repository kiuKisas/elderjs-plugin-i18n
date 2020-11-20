# Elder.js Plugin: i18n

## Status: WIP
You can use it right now but some features will not work until [PR#97](https://github.com/Elderjs/elderjs/pull/97) is merged.

- [ ] Documentation
- [ ] `svelte-i18n` integration

## Current issues
- [ ] html lang attribute (waiting for [PR#97](https://github.com/Elderjs/elderjs/pull/97))
- [ ] `excludesLocales` option will break `allPermalinks` helpers

## Features
- 0kb js in the build ( or integration with `svelte-i18n` soon ).
- Automatic routes generation and custom paths.
- Search engine optimisation.
- Support language (in ISO 639-1 format) and optionally a region (in ISO 3166-1 Alpha 2 format).
- Access routes for alternative locales.

## Install

```bash
npm i -s elderjs-plugin-i18n # or yarn add elderjs-plugin-i18n
```

## Config

Once installed, open your `elder.config.js` and configure the plugin by adding 'elder-plugin-i18n' to your plugin object.

```javascript
plugins: {
  'elderjs-plugin-i18n': {
      defaultLocale: 'fr',
      locales: ['fr', { code: 'en', iso: 'en' }],
      permalink: {
        prefix: true,
        prefixDefault: false,
      },
      hreflang: true,
      lang: true,
      excludeLocales: ['en'],
  },

}
```

### Automatic routes generation
- 3 strategies availables: prefix, subdomains and multiple domains
... explanation ...
- possible exception for default locale

### Search engine optimisation
- dynamic `html lang` attribute.
- `hreflangs` generation in `head` tag.
