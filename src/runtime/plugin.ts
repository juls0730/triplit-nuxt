import { defineNuxtPlugin } from '#app'
import {
    TriplitClient,
    HttpClient,
    type ClientOptions,
    type SimpleStorageOrInstances,
} from '@triplit/client'
// @ts-expect-error - injected by module.ts
import { schema } from '#triplit/schema'

export default defineNuxtPlugin({
    enforce: 'pre',
    setup: (nuxtApp) => {
        const config = nuxtApp.$config.public.triplit

        // Create appropriate client based on environment
        let client: TriplitClient | HttpClient | null = null

        if (import.meta.server) {
            // On server, use HTTP client for SSR
            if (config.serverUrl && config.token) {
                client = new HttpClient({
                    schema,
                    serverUrl: config.serverUrl,
                    token: config.token,
                })
            }
        }
        else {
            // On client, use WebSocket client
            const clientConfig: ClientOptions = {
                schema,
                autoConnect: config.autoConnect ?? true,
            }

            if (config.serverUrl) {
                clientConfig.serverUrl = config.serverUrl
            }

            if (config.token) {
                clientConfig.token = config.token
            }

            if (config.storage) {
                clientConfig.storage = config.storage as SimpleStorageOrInstances
            }

            client = new TriplitClient(clientConfig)
        }

        if (client) {
            nuxtApp.provide('triplit', client)
        }
    },
})
