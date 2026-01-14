import { useNuxtApp } from '#app'

export function useTriplitClient() {
  const { $triplit } = useNuxtApp()
  // This cast works because our addTypeTemplate in module.ts
  // already augmented the NuxtApp with the user's schema
  return $triplit
}
