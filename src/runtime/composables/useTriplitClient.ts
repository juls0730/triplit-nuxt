import { useNuxtApp } from '#app'
import type { HttpClient, TriplitClient } from '@triplit/client'
import type { TriplitAppSchema } from '#app'

export function useTriplitClient(): TriplitClient<TriplitAppSchema> | HttpClient<TriplitAppSchema> {
    const { $triplit } = useNuxtApp()
    // This cast works because our addTypeTemplate in module.ts
    // already augmented the NuxtApp with the user's schema
    return $triplit as TriplitClient<TriplitAppSchema> | HttpClient<TriplitAppSchema>
}
