# Quick Reference Guide - @nuxtjs/triplit

## Installation & Setup

```bash
npm install @nuxtjs/triplit @triplit/client
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/triplit'],
  triplit: {
    serverUrl: process.env.TRIPLIT_SERVER_URL,
    token: process.env.TRIPLIT_TOKEN,
    storage: 'indexeddb',
    autoConnect: true,
  },
})
```

```env
# .env
NUXT_PUBLIC_TRIPLIT_SERVER_URL=https://your-project.triplit.io
NUXT_PUBLIC_TRIPLIT_TOKEN=eyJhbGc...
```

## Composables Quick Reference

### Reading Data

```typescript
// Multiple results
const { results, fetching, error } = useQuery(
  client.query('todos')
)

// Single result
const { result, fetching } = useQueryOne(
  client.query('todos').Id('123')
)

// Connection status
const { status } = useConnectionStatus()
// status: 'OPEN' | 'CLOSED' | 'CONNECTING'
```

### Writing Data

```typescript
// Insert
const { insert, loading, error } = useInsert()
await insert('todos', { text: 'Buy milk', completed: false })

// Update
const { update } = useUpdate()
await update('todos', '123', (entity) => {
  entity.completed = true
})

// Delete
const { delete: deleteTodo } = useDelete()
await deleteTodo('todos', '123')
```

## Query Examples

```typescript
// Basic query
client.query('todos')

// Filter
client.query('todos').Where('completed', '=', false)

// Multiple filters
client.query('todos')
  .Where('completed', '=', false)
  .Where('priority', '=', 'high')

// Order
client.query('todos').Order('createdAt', 'DESC')

// Limit
client.query('todos').Limit(10)

// Get by ID
client.query('todos').Id('todo-123')

// Combining
client.query('todos')
  .Where('completed', '=', false)
  .Order('createdAt', 'DESC')
  .Limit(20)
```

## Common Patterns

### Todo App
```vue
<script setup lang="ts">
const { results: todos, fetching } = useQuery(
  client.query('todos').Order('createdAt', 'DESC')
)

const { insert } = useInsert()
const { update } = useUpdate()
const { delete: deleteItem } = useDelete()

const handleAdd = async (text: string) => {
  await insert('todos', { text, completed: false })
}

const handleToggle = async (id: string, completed: boolean) => {
  await update('todos', id, (entity) => {
    entity.completed = !completed
  })
}

const handleDelete = async (id: string) => {
  await deleteItem('todos', id)
}
</script>

<template>
  <div v-if="fetching">Loading...</div>
  <ul v-else>
    <li v-for="todo in todos" :key="todo.id">
      <input
        type="checkbox"
        :checked="todo.completed"
        @change="handleToggle(todo.id, todo.completed)"
      />
      {{ todo.text }}
      <button @click="handleDelete(todo.id)">Delete</button>
    </li>
  </ul>
</template>
```

### Real-time Chat
```vue
<script setup lang="ts">
const { results: messages } = useQuery(
  client.query('messages')
    .Order('createdAt', 'DESC')
    .Limit(50)
)

const { insert } = useInsert()

const sendMessage = async (text: string) => {
  await insert('messages', {
    text,
    authorId: currentUser.id,
    createdAt: new Date(),
  })
}
</script>

<template>
  <div class="messages">
    <div v-for="msg in messages" :key="msg.id">
      <strong>{{ msg.authorName }}:</strong> {{ msg.text }}
    </div>
  </div>
  <input @keyup.enter="sendMessage" placeholder="Message..." />
</template>
```

### Server-side Operations
```typescript
// server/api/cleanup.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const client = new HttpClient({
    serverUrl: config.triplit.serverUrl,
    token: config.triplit.token,
  })

  const oldMessages = await client.fetch(
    client.query('messages')
      .Where('createdAt', '<', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  )

  for (const msg of oldMessages) {
    await client.delete('messages', msg.id)
  }

  return { deleted: oldMessages.length }
})
```

### TypeScript with Schema
```typescript
import type { Entity } from '@triplit/client'
import { schema } from '~/triplit/schema'

type Todo = Entity<typeof schema, 'todos'>
type User = Entity<typeof schema, 'users'>

// Now fully typed
const { results: todos } = useQuery<Todo>(
  client.query('todos')
)

// todos is Ref<Todo[] | null>
const firstTodo: Todo | undefined = todos.value?.[0]
```

## Environment Setup

### Local Development
```bash
npx triplit dev
# Server: http://localhost:6543
# Console: https://console.triplit.dev/local
```

### Production
```env
NUXT_PUBLIC_TRIPLIT_SERVER_URL=https://your-project.triplit.io
NUXT_PUBLIC_TRIPLIT_TOKEN=eyJhbGc... # Anonymous token only
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Module not found" | Add to `modules:` in nuxt.config.ts |
| Env vars not working | Use `NUXT_PUBLIC_` prefix |
| No data loading | Check token permissions and server URL |
| Slow hydration | Use `.Limit()` on queries |
| "Client not initialized" | Ensure plugin loads before composables |

## Performance Tips

1. **Limit large queries**
   ```typescript
   client.query('posts').Limit(20)
   ```

2. **Use specific IDs**
   ```typescript
   client.query('posts').Id('123')
   ```

3. **Filter early**
   ```typescript
   client.query('todos').Where('completed', '=', true)
   ```

4. **Index frequently queried fields**
   Define indexes in your Triplit schema

## Resources

- [Triplit Documentation](https://www.triplit.dev)
- [Module GitHub](https://github.com/your-org/triplit-nuxt)
- [Nuxt Documentation](https://nuxt.com)
- [Vue 3 Docs](https://vuejs.org)

---

**Version**: 0.1.0 | **License**: MIT
