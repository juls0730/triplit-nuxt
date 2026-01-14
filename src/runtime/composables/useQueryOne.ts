import { ref, readonly, onUnmounted } from 'vue'
import type { TriplitClient, HttpClient } from '@triplit/client'
import { useNuxtApp } from '#app'

export interface UseQueryOneReturn<T extends Record<string, any>> {
    result: any
    fetching: any
    fetchingLocal: any
    fetchingRemote: any
    error: any
}

/**
 * SSR-ready composable for fetching a single entity
 */
export function useQueryOne<T extends Record<string, any>>(
    query: any,
    options: { syncStatus?: 'all' | 'synced' | 'pending' } = {}
): UseQueryOneReturn<T> {
    const nuxtApp = useNuxtApp()
    const client = nuxtApp.$triplit as TriplitClient | HttpClient

    const result = ref<T | null>(null)
    const fetching = ref(true)
    const fetchingLocal = ref(true)
    const fetchingRemote = ref(false)
    const error = ref<Error | null>(null)

    if (process.server) {
        const fetchData = async () => {
            try {
                if (!client || !('fetchOne' in client)) {
                    fetching.value = false
                    return
                }
                const data = await (client as HttpClient).fetchOne(query)
                result.value = data as T
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
        if (client && 'subscribe' in client) {
            let unsubscribe: (() => void) | null = null

            const subscribe = () => {
                unsubscribe = (client as TriplitClient).subscribe(
                    query,
                    (data: any[]) => {
                        result.value = data?.[0] || null
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
        result: readonly(result),
        fetching: readonly(fetching),
        fetchingLocal: readonly(fetchingLocal),
        fetchingRemote: readonly(fetchingRemote),
        error: readonly(error),
    }
}
