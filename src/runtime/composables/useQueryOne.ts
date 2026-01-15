import { ref, readonly, onScopeDispose, type Ref } from 'vue'
import type {
  TriplitClient,
  HttpClient,
  Models,
  SyncStatus,
  SchemaQuery,
  FetchResult,
} from '@triplit/client'
import { useState } from '#app'

export interface UseQueryOneReturn<T> {
  result: Ref<T>
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
  Q extends SchemaQuery<M>,
>(
  triplit: TriplitClient<M> | HttpClient<M>,
  query: Q,
  options: { syncStatus?: SyncStatus } = {},
) {
  type T = FetchResult<M, Q, 'one'> | undefined

  const result = useState<T>()
  const fetching = ref(true)
  const clientFetching = ref(true)
  const error = ref<Error | null>(null)

  if (import.meta.server) {
    try {
      const data = await triplit.fetchOne(query)
      result.value = data
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      clientFetching.value = false
    }
    finally {
      fetching.value = false
    }
  }
  else if ('subscribe' in triplit) {
    await triplit.fetchOne(query)

    const unsubscribe = triplit.subscribe(
      query,
      (data) => {
        result.value = data?.[0] || undefined
        clientFetching.value = false
        fetching.value = false
      },
      (err) => {
        error.value = err
        clientFetching.value = false
        fetching.value = false
      },
      options,
    )

    onScopeDispose(unsubscribe)
  }

  return {
    result: readonly(result),
    fetching: readonly(fetching),
    clientFetching: readonly(clientFetching),
    error: readonly(error),
  }
}
