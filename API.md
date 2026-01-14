# @nuxtjs/triplit - Complete API Reference

## Module Configuration

### `defineNuxtConfig`
```typescript
export interface ModuleOptions {
  serverUrl?: string                      // Triplit server URL
  token?: string                          // Anonymous or service token
  schema?: Schema                         // Optional Triplit schema
  storage?: 'memory' | 'indexeddb' | {   // Client storage
    type: 'indexeddb'
    name: string
  }
  autoConnect?: boolean                   // Auto-connect on client (default: true)
}
```

## Composables

### `useTriplitClient()`
Get the Triplit client instance.

**Returns:**
```typescript
TriplitClient | HttpClient
```

**Example:**
```typescript
const client = useTriplitClient()
const query = client.query('todos')
```

---

### `useQuery<T>(query, options?)`
Subscribe to multiple entities.

**Parameters:**
```typescript
query: Query                             // Triplit query
options?: {
  syncStatus?: 'all' | 'synced' | 'pending'
}
```

**Returns:**
```typescript
{
  results: Ref<T[] | null>              // Array of entities
  fetching: Ref<boolean>                 // Any fetch in progress
  fetchingLocal: Ref<boolean>            // Local cache fetch
  fetchingRemote: Ref<boolean>           // Remote sync fetch
  error: Ref<Error | null>              // Error if failed
}
```

**Example:**
```typescript
const { results, fetching, error } = useQuery(
  client.query('todos').Where('completed', '=', false)
)
```

---

### `useQueryOne<T>(query, options?)`
Subscribe to a single entity.

**Parameters:**
```typescript
query: Query                             // Triplit query
options?: {
  syncStatus?: 'all' | 'synced' | 'pending'
}
```

**Returns:**
```typescript
{
  result: Ref<T | null>                 // Single entity (not array)
  fetching: Ref<boolean>
  fetchingLocal: Ref<boolean>
  fetchingRemote: Ref<boolean>
  error: Ref<Error | null>
}
```

**Example:**
```typescript
const { result, fetching } = useQueryOne(
  client.query('posts').Id('post-123')
)
```

---

### `useConnectionStatus()`
Monitor connection status to Triplit server.

**Returns:**
```typescript
{
  status: Ref<'OPEN' | 'CLOSED' | 'CONNECTING'>
}
```

**Example:**
```typescript
const { status } = useConnectionStatus()
if (status.value === 'OPEN') {
  console.log('Connected to Triplit')
}
```

---

### `useInsert()`
Insert new entities into a collection.

**Returns:**
```typescript
{
  insert: (collectionName: string, entity: Record<string, any>) => Promise<void>
  loading: Ref<boolean>
  error: Ref<Error | null>
}
```

**Example:**
```typescript
const { insert, loading, error } = useInsert()
try {
  await insert('todos', {
    text: 'Buy milk',
    completed: false,
    createdAt: new Date(),
  })
} catch (err) {
  console.error('Insert failed:', err)
}
```

---

### `useUpdate()`
Update existing entities in a collection.

**Returns:**
```typescript
{
  update: (
    collectionName: string,
    entityId: string,
    updateFn: (entity: any) => Promise<void> | void
  ) => Promise<void>
  loading: Ref<boolean>
  error: Ref<Error | null>
}
```

**Example:**
```typescript
const { update, loading } = useUpdate()
await update('todos', 'todo-123', (entity) => {
  entity.completed = true
  entity.updatedAt = new Date()
})
```

---

### `useDelete()`
Delete entities from a collection.

**Returns:**
```typescript
{
  delete: (collectionName: string, entityId: string) => Promise<void>
  loading: Ref<boolean>
  error: Ref<Error | null>
}
```

**Example:**
```typescript
const { delete: deleteTodo, loading } = useDelete()
await deleteTodo('todos', 'todo-123')
```

---

## Type Definitions

### Entity Type Helper
```typescript
import type { Entity } from '@triplit/client'
import { schema } from '~/triplit/schema'

type Todo = Entity<typeof schema, 'todos'>
type User = Entity<typeof schema, 'users'>
```

### Query Result Type Helper
```typescript
import type { QueryResult } from '@triplit/client'
import { schema } from '~/triplit/schema'

type UserWithPosts = QueryResult<
  typeof schema,
  { collectionName: 'users', select: ['id', 'name'] }
>
```

---

## Global Properties

### `$triplit`
Available on NuxtApp after plugin initialization.

```typescript
const nuxtApp = useNuxtApp()
const client = nuxtApp.$triplit  // TriplitClient | HttpClient
```

---

## Environment Variables

Expose these in `nuxt.config.ts`:

```env
# Browser-accessible variables (must have NUXT_PUBLIC_ prefix)
NUXT_PUBLIC_TRIPLIT_SERVER_URL=https://your-project.triplit.io
NUXT_PUBLIC_TRIPLIT_TOKEN=eyJhbGc...
```

---

## Auto-Imports

All composables are auto-imported in Vue components:

```vue
<script setup lang="ts">
// No import needed!
const client = useTriplitClient()
const { results } = useQuery(...)
const { insert } = useInsert()
</script>
```

---

## Error Handling

All composables provide error refs:

```typescript
const { results, error } = useQuery(query)

watch(error, (err) => {
  if (err) {
    console.error('Query failed:', err.message)
  }
})
```

Mutations throw errors on failure:

```typescript
const { insert } = useInsert()

try {
  await insert('todos', data)
} catch (err) {
  console.error('Insert failed:', err)
}
```

---

## Reactive State

All return values are reactive Vue refs:

```typescript
const { results, fetching } = useQuery(query)

// Can watch
watch(results, (newResults) => {
  console.log('Results changed:', newResults)
})

// Can use computed
const todoCount = computed(() => results.value?.length ?? 0)

// Can destructure with readonly
const { results: readonly } = useQuery(query)
```

---

## Server vs Client

Composables detect environment automatically:

**Server:**
- `useQuery()` → HTTP fetch once
- `useQueryOne()` → HTTP fetch once
- `useConnectionStatus()` → Always 'OPEN'
- `useInsert/Update/Delete()` → HTTP mutation

**Client:**
- `useQuery()` → WebSocket subscription
- `useQueryOne()` → WebSocket subscription
- `useConnectionStatus()` → Real connection status
- `useInsert/Update/Delete()` → Optimistic updates + sync

---

## Query API

Use Triplit's query builder:

```typescript
client.query('todos')
  .Where('completed', '=', false)
  .Where('priority', '!=', 'low')
  .Order('createdAt', 'DESC')
  .Limit(20)
  .Offset(10)
  .Include('assignee')
  .Select(['id', 'text', 'completed'])
```

---

## Configuration Access

Access runtime config in server routes:

```typescript
// server/api/sync.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const serverUrl = config.triplit?.serverUrl
  const token = config.triplit?.token
})
```

---

## License

MIT - See LICENSE file for details

