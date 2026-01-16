import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addImportsDir,
  addTypeTemplate,
} from '@nuxt/kit'
import type { SimpleStorageOrInstances } from '@triplit/client'
import { defu } from 'defu'
import { join } from 'node:path'

export interface ModuleOptions {
  /**
   * The URL of your Triplit server
   */
  serverUrl?: string
  /**
   * The anonymous token for your triplit server
   */
  token?: string
  dangerouslyAllowNonAnonymousTokens?: boolean
  /**
   * The path to your triplit schema file (must export `schema`)
   */
  schema_path?: string
  /**
   * The storage to use (default: `indexeddb`, either `memory` or `indexeddb`)
   */
  storage?: 'indexeddb' | 'memory' | SimpleStorageOrInstances
  /**
   * Automatically connect to the server on startup (default: `true`)
   */
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
    dangerouslyAllowNonAnonymousTokens: false,
    schema_path: './triplit/schema.ts',
    storage: 'indexeddb',
    autoConnect: true,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    const schemaImportPath = join(nuxt.options.rootDir, options.schema_path!)

    // 2. Add the dynamic type template
    addTypeTemplate({
      filename: 'types/triplit.d.ts',
      getContents: () => `
import type { TriplitClient, HttpClient } from '@triplit/client'
import { schema } from '${schemaImportPath}'

type TriplitAppSchema = typeof schema;

declare module '#app' {
  interface NuxtApp {
    $triplit: TriplitClient<TriplitAppSchema> | HttpClient<TriplitAppSchema>
  }

  export {
      TriplitAppSchema
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $triplit: TriplitClient<TriplitAppSchema> | HttpClient<TriplitAppSchema>
  }
}

export {}
      `,
    })

    addPlugin(resolver.resolve('./runtime/plugin'))

    addImportsDir(resolver.resolve('./runtime/composables'))

    nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {}
    nuxt.options.vite.optimizeDeps.include = nuxt.options.vite.optimizeDeps.include || []
    nuxt.options.vite.optimizeDeps.include.push(
      '@triplit/client',
    )

    nuxt.options.build.transpile = nuxt.options.build.transpile || []
    nuxt.options.build.transpile.push('@triplit/client')

    nuxt.options.runtimeConfig.public.triplit = defu(
      nuxt.options.runtimeConfig.public.triplit,
      {
        serverUrl:
          options.serverUrl || process.env.NUXT_PUBLIC_TRIPLIT_SERVER_URL || '',
        token: options.token || process.env.NUXT_ANON_TRIPLIT_TOKEN || '',
        dangerouslyAllowNonAnonymousTokens: options.dangerouslyAllowNonAnonymousTokens || false,
        storage: options.storage || 'indexeddb',
        autoConnect: options.autoConnect ?? true,
      },
    )

    const { token, dangerouslyAllowNonAnonymousTokens } = nuxt.options.runtimeConfig.public.triplit

    if (token && !dangerouslyAllowNonAnonymousTokens) {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid token')
      }

      const tokenType = JSON.parse(atob(parts[1]!))['x-triplit-token-type']
      if (tokenType !== 'anon') {
        const errorMessage
          = '[triplit-nuxt] Security alert: You are using a token with a type of "' + tokenType + '". '
            + 'This will allow unauthenticated users to access data they should not have access to. '
            + 'Please use a token with type "anonymous" in your config, or add the key '
            + '"dangerouslyAllowNonAnonymousTokens" to your config with a value of true to skip this error.'

        throw new Error(errorMessage)
      }
    }
  },
})
