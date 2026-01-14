import { ref, readonly } from 'vue'
import type { TriplitClient, HttpClient } from '@triplit/client'

/**
 * SSR-ready composable for inserting data into Triplit
 */
export function useInsert() {
  const nuxtApp = useNuxtApp()
  const client = nuxtApp.$triplit as TriplitClient | HttpClient

  const error = ref<Error | null>(null)
  const loading = ref(false)

  const insert = async (collectionName: string, entity: Record<string, any>) => {
    loading.value = true
    error.value = null

    try {
      if (!client || !('insert' in client)) {
        throw new Error('Triplit client not available')
      }

      await (client as any).insert(collectionName, entity)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    insert,
    loading: readonly(loading),
    error: readonly(error),
  }
}
