import { ref, readonly, type Ref, onScopeDispose } from 'vue'
import type {
  SyncStatus,
  Models,
  TriplitClient,
  HttpClient,
  FetchResult,
  SchemaQuery,
} from '@triplit/client'
import { useState } from '#app'

export interface UseQueryReturn<T> {
  results: Ref<T>
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
  Q extends SchemaQuery<M>,
>(
  triplit: TriplitClient<M> | HttpClient<M>,
  query: Q,
  options: { syncStatus?: SyncStatus } = {},
) {
  type T = FetchResult<M, Q, 'many'> | undefined

  const results = useState<T>()
  const fetching = ref(true)
  const clientFetching = ref(true)
  const error = ref<Error | null>(null)

  // TODO: handle errors better
  if (import.meta.server) {
    // SSR logic
    try {
      const data = await triplit.fetch(query)
      results.value = data
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
    // fetch items before subscribing so that we dont subscribe and get empty data immediately (because its fetching the data)
    // then get the actual data when its ready (causing a flash of empty data)
    await triplit.fetch(query)

    const unsubscribe = triplit.subscribe(
      query,
      (data) => {
        results.value = data
        clientFetching.value = false
        fetching.value = false
      },
      (err) => {
        error.value = err as Error
        clientFetching.value = false
        fetching.value = false
      },
      options,
    )
    onScopeDispose(unsubscribe)
  }

  return {
    results: readonly(results),
    fetching: readonly(fetching),
    clientFetching: readonly(clientFetching),
    error: readonly(error),
  }
}
