import { defineNuxtModule, addPlugin, createResolver, addImportsDir, addTypeTemplate } from '@nuxt/kit'
import { defu } from 'defu'
import type { Schema } from '@triplit/client'

export interface ModuleOptions {
  serverUrl?: string
  token?: string
  schema?: Schema
  storage?: 'memory' | 'indexeddb' | { type: 'indexeddb', name: string }
  autoConnect?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtjs/triplit',
    configKey: 'triplit',
  },
  defaults: {
    serverUrl: '',
    token: '',
    storage: 'indexeddb',
    autoConnect: true,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addPlugin(resolver.resolve('./runtime/plugin'))

    addImportsDir(resolver.resolve('./runtime/composables'))

    nuxt.options.runtimeConfig.public.triplit = defu(nuxt.options.runtimeConfig.public.triplit, {
      serverUrl: options.serverUrl || process.env.NUXT_PUBLIC_TRIPLIT_SERVER_URL || '',
      token: options.token || process.env.NUXT_PUBLIC_TRIPLIT_TOKEN || '',
      storage: options.storage || 'indexeddb',
      autoConnect: options.autoConnect ?? true,
    })

    addTypeTemplate({
      filename: 'types/triplit.d.ts',
      getContents: () => `
import type { TriplitClient } from '@triplit/client'

declare module '#app' {
  interface NuxtApp {
    $triplit: TriplitClient
  }
}

export {}
      `
    })
  },
})
