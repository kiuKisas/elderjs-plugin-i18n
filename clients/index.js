const clients = [['svelte-i18n', () => import('./svelte-i18n')]]

const clientOptions = (client, defaultLocale, { config, options }) => Object.assign(client.processConfig(config, defaultLocale), options)

const fillClientDictionary = (client, data) => data.forEach(d => client.addEntry(d.locale, d.content))

// Init Should be call during render and in client side

module.exports = { clientOptions, fillClientDictionary, clients }
