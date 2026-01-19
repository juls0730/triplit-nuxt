import { ref, readonly, type Ref, watch, isRef, computed } from 'vue'
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

export function toQueryRef<Q>(q: Q | Ref<Q> | (() => Q)): Ref<Q> {
  if (isRef(q)) return q
  if (typeof q === 'function') return computed(q as () => Q)
  return ref(q) as Ref<Q>
}

/**
 * Fully type-safe useQuery composable
 */
export async function useQuery<
  M extends Models<M>,
  Q extends SchemaQuery<M>,
>(
  key: string,
  triplit: TriplitClient<M> | HttpClient<M>,
  query: Q | Ref<Q> | (() => Q),
  options: { syncStatus?: SyncStatus } = {},
) {
  const queryRef = toQueryRef(query)

  type T = FetchResult<M, Q, 'many'> | undefined

  const results = useState<T>(key)
  const fetching = ref(true)
  const clientFetching = ref(true)
  const error = ref<Error | null>(null)

  let currentUnsubscribe: (() => void) | undefined

  const runQuery = async (q: Q) => {
    fetching.value = true
    clientFetching.value = true
    error.value = null

    if (import.meta.server) {
      try {
        const data = await triplit.fetch(q)
        results.value = data as T
      }
      catch (err) {
        error.value = err instanceof Error ? err : new Error(String(err))
      }
      finally {
        fetching.value = false
        clientFetching.value = false
      }
      return
    }

    if (currentUnsubscribe) {
      currentUnsubscribe()
      currentUnsubscribe = undefined
    }

    try {
      const snapshot = await triplit.fetch(q)
      results.value = snapshot as T
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    }

    if ('subscribe' in triplit) {
      currentUnsubscribe = triplit.subscribe(
        q,
        (data) => {
          results.value = data as T
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
    }
    else {
      fetching.value = false
    }
  }

  // TODO: handle errors better
  if (!import.meta.server) {
    watch(
      queryRef,
      async (newQ, _oldQ, onCleanup) => {
        await runQuery(newQ)

        onCleanup(() => {
          if (currentUnsubscribe) {
            currentUnsubscribe()
            currentUnsubscribe = undefined
          }
        })
      },
      { immediate: true },
    )
  }
  else {
    await runQuery(queryRef.value)
  }

  const unsubscribe = () => {
    if (currentUnsubscribe) {
      currentUnsubscribe()
      currentUnsubscribe = undefined
    }
  }

  return {
    results: readonly(results),
    fetching: readonly(fetching),
    clientFetching: readonly(clientFetching),
    error: readonly(error),
    unsubscribe,
  }
}
