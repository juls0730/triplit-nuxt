export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },

  vite: {
    server: {
      allowedHosts: true,
    },
  },

  triplit: {
    // use memory for local development so we dont have to worry about broken values in the local indexeddb
    storage: 'memory',
  },
})
