import { ref, readonly } from 'vue'
import type { TriplitClient, HttpClient } from '@triplit/client'

export interface UseConnectionStatusReturn {
  status: any
}

/**
 * SSR-ready composable for monitoring connection status
 * Returns 'OPEN' or 'CLOSED' on server (always OPEN for HTTP)
 */
export function useConnectionStatus(): UseConnectionStatusReturn {
  const nuxtApp = useNuxtApp()
  const client = nuxtApp.$triplit as TriplitClient | HttpClient

  const status = ref<'OPEN' | 'CLOSED' | 'CONNECTING'>(
    process.server ? 'OPEN' : 'CONNECTING'
  )

  if (!process.server && client && 'connectionStatus' in client) {
    status.value = (client as TriplitClient).connectionStatus as any

    const unsubscribe = (client as TriplitClient).onConnectionStatusChange(
      (newStatus) => {
        status.value = newStatus as any
      }
    )

    onUnmounted(() => {
      unsubscribe()
    })
  }

  return {
    status: readonly(status),
  }
}
