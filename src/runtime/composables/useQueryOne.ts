import { ref, readonly, onUnmounted, type Ref } from 'vue'
import type { TriplitClient, HttpClient, Models, CollectionNameFromModels, SyncStatus, Entity, QueryBuilder, WithInclusion, CollectionQuery } from '@triplit/client'

export interface UseQueryOneReturn<T> {
  result: Ref<T | null>
  fetching: Ref<boolean>
  fetchingLocal: Ref<boolean>
  fetchingRemote: Ref<boolean>
  error: Ref<Error | null>
}

/**
 * SSR-ready composable for fetching a single entity
 * On server: uses HTTP client to fetch data once
 * On client: uses WebSocket client for real-time updates
 *
 * @template T - The entity type returned by the query (inferred from the query builder)
 *
 * @example
 * ```ts
 * // With proper schema typing:
 * const { result } = useQueryOne<TodoEntity>(client.query('todos').limit(1))
 * // result is Ref<TodoEntity | null>
 * ```
 */
export async function useQueryOne<
  M extends Models<M>,
  CN extends CollectionNameFromModels<M>,
>(
  triplit: TriplitClient<M> | HttpClient<M>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  query: QueryBuilder<M, CN, WithInclusion<CollectionQuery<M, CN>, {}>>,
  options: { syncStatus?: SyncStatus },
) {
  type T = Entity<M, CN>

  const result = ref<T | null>(null)
  const fetching = ref(true)
  const fetchingLocal = ref(true)
  const fetchingRemote = ref(false)
  const error = ref<Error | null>(null)

  if (import.meta.server) {
    try {
      if ('fetchOne' in triplit) {
        const data = await triplit.fetchOne(query)
        result.value = (data || null) as T | null
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      fetchingLocal.value = false
    }
    finally {
      fetching.value = false
    }
  }
  else if (triplit && 'subscribe' in triplit) {
    let unsubscribe: (() => void) | null = null

    const subscribe = () => {
      unsubscribe = triplit.subscribe(
        query,
        (data: T[]) => {
          result.value = (data?.[0] || null) as T | null
          fetchingLocal.value = false
          fetching.value = false
        },
        (err) => {
          error.value = err
          fetchingLocal.value = false
          fetching.value = false
        },
        options,
      )
    }

    subscribe()

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })
  }

  return {
    result: readonly(result) as Ref<T | null>,
    fetching: readonly(fetching) as Ref<boolean>,
    fetchingLocal: readonly(fetchingLocal) as Ref<boolean>,
    fetchingRemote: readonly(fetchingRemote) as Ref<boolean>,
    error: readonly(error) as Ref<Error | null>,
  }
}
