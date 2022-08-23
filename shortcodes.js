const i18nShortcodes = [
  {
    shortcode: "i18nHref",
    run: async ({ props, content, helpers, plugin, request }) => {
      if (!props?.href) {
        throw new Error(
          `elderjs-plugin-i18n [i18nHref shortcode]: i18nHref shortcode requires href prop`
        );
      }

      // Append a trailing slash to the href if it's missing
      if (props.href.slice(-1) !== "/") {
        props.href = props.href + "/";
      }

      // Iterate all i18n requests to find the one corresponding to the props.href
      let href_destination_request = undefined;
      for (const [_, route_obj] of Object.entries(
        plugin.dictionaries.requests
      )) {
        for (const [_, slug_obj] of Object.entries(route_obj)) {
          for (const [_, request_obj] of Object.entries(slug_obj)) {
            if (request_obj.permalink === props.href) {
              if (href_destination_request === undefined) {
                href_destination_request = request_obj;
              } else {
                throw new Error(
                  `elderjs-plugin-i18n [i18nHref shortcode]: multiple requests have permalink ${props.href}`
                );
              }
            }
          }
        }
      }
      if (href_destination_request === undefined) {
        console.warn(
          `elderjs-plugin-i18n [i18nHref shortcode]: no i18n requests exists for href ${props.href}, keeping this href (the destination page probably isn't available in different locales)`
        );
        return `<a href=${props.href} >${content}</a>`;
      }

      // Get the different i18n permalinks corresponding to the hrefs destination
      const allPermalinks = helpers.i18n.allPermalinks(
        href_destination_request
      );

      // The permalink should point to the same locale as this page/request
      if (request?.locale === undefined) {
        console.warn(
          `elderjs-plugin-i18n [i18nHref shortcode]: request.locale is undefined, assuming default locale '${plugin.config.locales.content_default}' for page ${request.permalink}`
        );
        request.locale;
      }
      const request_locale = request?.locale
        ? request.locale
        : plugin.config.locales.content_default;

      const href_target_request = allPermalinks.filter(
        ({ locale }) => locale === request_locale
      )[0];

      return `<a href=${href_target_request.permalink} >${content}</a>`;
    },
  },
];

module.exports = { i18nShortcodes };
