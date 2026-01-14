import { ref, readonly, onUnmounted, type Ref } from 'vue'
import type { TriplitClient, HttpClient, ConnectionStatus } from '@triplit/client'
import { useNuxtApp } from '#app'

export interface UseConnectionStatusReturn {
  status: Readonly<Ref<ConnectionStatus>>
}

/**
 * SSR-ready composable for monitoring connection status
 * Returns 'OPEN' or 'CLOSED' on server (always OPEN for HTTP)
 */
export function useConnectionStatus(): UseConnectionStatusReturn {
  const nuxtApp = useNuxtApp()
  const client = nuxtApp.$triplit as TriplitClient | HttpClient

  const status = ref<ConnectionStatus>(
    import.meta.server ? 'OPEN' : 'CONNECTING',
  )

  if (!import.meta.server && client && 'connectionStatus' in client) {
    status.value = (client as TriplitClient).connectionStatus

    const unsubscribe = (client as TriplitClient).onConnectionStatusChange(
      (newStatus) => {
        status.value = newStatus
      },
    )

    onUnmounted(() => {
      unsubscribe()
    })
  }

  return {
    status: readonly(status),
  }
}
