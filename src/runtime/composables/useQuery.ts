import { ref, readonly, type Ref, watch, isRef, computed, type ComputedRef } from 'vue'
import type {
    Models,
    TriplitClient,
    HttpClient,
    FetchResult,
    SchemaQuery,
    ClientFetchOptions,
} from '@triplit/client'
import { useAsyncData } from '#app'

export interface UseQueryReturn<T> {
    results: Ref<T>
    fetching: Ref<boolean>
    fetchingLocal: Ref<boolean>
    fetchingRemote: Ref<boolean>
    error: Ref<Error | null>
}

export function toQueryRef<Q>(q: Q | Ref<Q> | ComputedRef<Q> | (() => Q)): Ref<Q> {
    if (isRef(q)) return q
    if (typeof q === 'function') return computed(q as () => Q)
    return ref(q) as Ref<Q>
}

/**
 * Fully type-safe useQuery composable
 * @param key - unique key for the query
 * @param triplit - triplit client
 * @param query - query to run
 * @param options - options for the query
 * @param options.syncStatus - sync status to use
 */
export async function useQuery<
    M extends Models<M>,
    Q extends SchemaQuery<M>,
>(
    key: string,
    triplit: TriplitClient<M> | HttpClient<M>,
    query: Q | Ref<Q> | ComputedRef<Q> | (() => Q),
    options: Partial<ClientFetchOptions> = {},
) {
    type T = FetchResult<M, Q, 'many'> | undefined

    const queryRef = toQueryRef(query)
    const fetchingLocal = ref(false)
    const fetchingRemote = ref(false)
    let currentUnsubscribe: (() => void) | undefined

    const { data: results, pending: fetching, error } = await useAsyncData<T>(key, async () => {
        const q = queryRef.value
        if (import.meta.server) {
            return await triplit.fetch(q, options)
        }
    }, { dedupe: 'defer' })

    if (import.meta.client) {
        let resolveInitial: () => void
        const initialPromise = new Promise<void>((resolve) => {
            resolveInitial = resolve
        })

        watch(queryRef, (newQ, _oldQ, onCleanup) => {
            if (currentUnsubscribe) {
                currentUnsubscribe()
                currentUnsubscribe = undefined
            }

            if ('subscribe' in triplit) {
                currentUnsubscribe = triplit.subscribeWithStatus(
                    newQ,
                    (data) => {
                        if (data.error) {
                            error.value = data.error
                            resolveInitial?.()
                            return
                        }

                        if (data.results !== undefined) {
                            results.value = data.results as T
                        }

                        fetchingLocal.value = data.fetchingLocal
                        fetchingRemote.value = data.fetchingRemote

                        if (!data.fetching) {
                            resolveInitial?.()
                        }
                    },
                    options,
                )
            }

            onCleanup(() => {
                if (currentUnsubscribe) {
                    currentUnsubscribe()
                    currentUnsubscribe = undefined
                }
            })
        }, { immediate: true })

        // make sure we have at gotten the initial data even if we are the client and not SSR'd
        if (results.value === undefined) {
            await initialPromise
        }
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
        fetchingLocal: readonly(fetchingLocal),
        fetchingRemote: readonly(fetchingRemote),
        error: readonly(error),
        unsubscribe,
    }
}
