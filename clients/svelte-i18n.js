const { addMessages, init, getLocaleFromNavigator } = require('svelte-i18n')

const defaultConfig = {
  initialLocale: 'default',
  fallback: 'default'
}

const addEntry = addMessages

const processInitialLocale = (configInitialLocale, defaultLocale) => {
  // Add others
  switch (configInitialLocale) {
    case 'navigator':
      return () => getLocaleFromNavigator()
    case 'default':
      return defaultLocale
    default:
      return configInitialLocale
  }
}

const processFallbackLocale = (configFallbackLocale, defaultLocale) => {
  if (configFallbackLocale === 'default') return defaultLocale
  return configFallbackLocale
}

const processConfig = (config, defaultLocale) => {
  const options = Object.assign({}, defaultConfig, config)
  return {
    initialLocale: processInitialLocale(options.initialLocale, defaultLocale),
    fallbackLocale: processFallbackLocale(options.fallbackLocale, defaultLocale)
  }
}

module.exports = { addEntry, init, processConfig }
