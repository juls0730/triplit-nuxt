import { ref, readonly } from 'vue'
import type { TriplitClient, HttpClient } from '@triplit/client'
import { useNuxtApp } from '#app'

/**
 * SSR-ready composable for updating data in Triplit
 */
export function useUpdate() {
    const nuxtApp = useNuxtApp()
    const client = nuxtApp.$triplit as TriplitClient | HttpClient

    const error = ref<Error | null>(null)
    const loading = ref(false)

    const update = async (
        collectionName: string,
        entityId: string,
        updateFn: (entity: any) => Promise<void> | void
    ) => {
        loading.value = true
        error.value = null

        try {
            if (!client || !('update' in client)) {
                throw new Error('Triplit client not available')
            }

            await (client as any).update(collectionName, entityId, updateFn)
        } catch (err) {
            error.value = err instanceof Error ? err : new Error(String(err))
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        update,
        loading: readonly(loading),
        error: readonly(error),
    }
}
