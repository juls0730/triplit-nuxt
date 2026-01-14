import { TriplitClient, HttpClient } from '@triplit/client'
import type { Schema } from '@triplit/client'

let clientInstance: TriplitClient | null = null

export function createTriplitClient(options: {
  schema?: Schema
  serverUrl?: string
  token?: string
  storage?: 'memory' | 'indexeddb' | { type: 'indexeddb'; name: string }
  autoConnect?: boolean
} = {}) {
  if (clientInstance) {
    return clientInstance
  }

  const {
    schema,
    serverUrl = import.meta.env.VITE_TRIPLIT_SERVER_URL || '',
    token = import.meta.env.VITE_TRIPLIT_TOKEN || '',
    storage = 'indexeddb',
    autoConnect = true,
  } = options

  clientInstance = new TriplitClient({
    schema,
    serverUrl,
    token,
    storage,
    autoConnect: typeof window !== 'undefined' ? autoConnect : false,
  })

  return clientInstance
}

export function getTriplitClient(): TriplitClient {
  if (!clientInstance) {
    throw new Error('Triplit client not initialized. Make sure @nuxtjs/triplit module is installed.')
  }
  return clientInstance
}

export function createHttpClient(options: {
  serverUrl?: string
  token?: string
} = {}) {
  const serverUrl = options.serverUrl || import.meta.env.VITE_TRIPLIT_SERVER_URL || ''
  const token = options.token || import.meta.env.VITE_TRIPLIT_TOKEN || ''

  if (!serverUrl || !token) {
    throw new Error('Missing Triplit server URL or token for HTTP client')
  }

  return new HttpClient({
    serverUrl,
    token,
  })
}

export function setTriplitClient(client: TriplitClient) {
  clientInstance = client
}
