import { ref, readonly } from 'vue'
import type { TriplitClient, HttpClient } from '@triplit/client'

/**
 * SSR-ready composable for deleting data from Triplit
 */
export function useDelete() {
  const nuxtApp = useNuxtApp()
  const client = nuxtApp.$triplit as TriplitClient | HttpClient

  const error = ref<Error | null>(null)
  const loading = ref(false)

  const delete_ = async (collectionName: string, entityId: string) => {
    loading.value = true
    error.value = null

    try {
      if (!client || !('delete' in client)) {
        throw new Error('Triplit client not available')
      }

      await (client as any).delete(collectionName, entityId)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    delete: delete_,
    loading: readonly(loading),
    error: readonly(error),
  }
}
