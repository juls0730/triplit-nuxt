import type { TriplitClient, HttpClient } from '@triplit/client'

/**
 * Get the Triplit client instance
 * On server: returns HttpClient
 * On client: returns TriplitClient
 */
export function useTriplitClient(): TriplitClient | HttpClient {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$triplit as TriplitClient | HttpClient
}
