import { ref, readonly, type Ref, onUnmounted } from 'vue'
import type { TriplitClient, HttpClient } from '@triplit/client'
import { useNuxtApp } from '#app'

export interface UseQueryReturn<T extends Record<string, any>> {
    results: Ref<T[] | null>
    fetching: Ref<boolean>
    fetchingLocal: Ref<boolean>
    fetchingRemote: Ref<boolean>
    error: Ref<Error | null>
}

/**
 * SSR-ready composable for subscribing to Triplit queries
 * On server: uses HTTP client to fetch data
 * On client: uses WebSocket client for real-time updates
 */
export function useQuery<T extends Record<string, any>>(
    query: any,
    options: { syncStatus?: 'all' | 'synced' | 'pending' } = {}
): UseQueryReturn<T> {
    const nuxtApp = useNuxtApp()
    const client = nuxtApp.$triplit as TriplitClient | HttpClient

    const results = ref<T[] | null>(null)
    const fetching = ref(true)
    const fetchingLocal = ref(true)
    const fetchingRemote = ref(false)
    const error = ref<Error | null>(null)

    // Handle SSR vs Client differently
    if (process.server) {
        // SSR: Fetch data once and return
        const fetchData = async () => {
            try {
                if (!client || !('fetch' in client)) {
                    fetching.value = false
                    return
                }
                const data = await (client as HttpClient).fetch(query)
                results.value = data as T[]
                fetchingLocal.value = false
            } catch (err) {
                error.value = err instanceof Error ? err : new Error(String(err))
                fetchingLocal.value = false
            } finally {
                fetching.value = false
            }
        }

        fetchData()
    } else {
        // Client: Subscribe to real-time updates
        if (client && 'subscribe' in client) {
            let unsubscribe: (() => void) | null = null

            const subscribe = () => {
                unsubscribe = (client as TriplitClient).subscribe(
                    query,
                    (data) => {
                        results.value = data as T[]
                        fetchingLocal.value = false
                        fetching.value = false
                    },
                    (err) => {
                        error.value = err
                        fetchingLocal.value = false
                        fetching.value = false
                    },
                    options as any
                )
            }

            subscribe()

            onUnmounted(() => {
                if (unsubscribe) {
                    unsubscribe()
                }
            })
        }
    }

    return {
        results: readonly(results) as Ref<T[] | null>,
        fetching: readonly(fetching),
        fetchingLocal: readonly(fetchingLocal),
        fetchingRemote: readonly(fetchingRemote),
        error: readonly(error),
    }
}
