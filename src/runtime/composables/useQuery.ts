import { ref, readonly, type Ref, onUnmounted } from 'vue'
import type { SyncStatus, Models, Entity, CollectionNameFromModels, TriplitClient, HttpClient, QueryBuilder, WithInclusion, CollectionQuery } from '@triplit/client'

export interface UseQueryReturn<T> {
  results: Ref<T | null>
  fetching: Ref<boolean>
  fetchingLocal: Ref<boolean>
  fetchingRemote: Ref<boolean>
  error: Ref<Error | null>
}

/**
 * Fully type-safe useQuery composable
 */
export async function useQuery<
  M extends Models<M>,
  CN extends CollectionNameFromModels<M>,
>(
  triplit: TriplitClient<M> | HttpClient<M>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  query: QueryBuilder<M, CN, WithInclusion<CollectionQuery<M, CN>, {}>>,
  options: { syncStatus?: SyncStatus } = {},
) {
  type T = Entity<M, CN>[]

  const results = ref<T | null>(null)
  const fetching = ref(true)
  const fetchingLocal = ref(true)
  const fetchingRemote = ref(false)
  const error = ref<Error | null>(null)

  if (import.meta.server) {
    // SSR logic
    try {
      if ('fetch' in triplit) {
        const data = await triplit.fetch(query)
        results.value = data as T
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    }
    finally {
      fetching.value = false
      fetchingLocal.value = false
    }
  }
  else {
    // Client logic
    if ('subscribe' in triplit) {
      const unsubscribe = triplit.subscribe(
        query,
        (data) => {
          results.value = data as T
          fetchingLocal.value = false
          fetching.value = false
        },
        (err) => {
          error.value = err as Error
          fetching.value = false
        },
        options,
      )
      onUnmounted(unsubscribe)
    }
  }

  return {
    results: readonly(results) as Ref<T | null>,
    fetching: readonly(fetching),
    fetchingLocal: readonly(fetchingLocal),
    fetchingRemote: readonly(fetchingRemote),
    error: readonly(error),
  }
}
