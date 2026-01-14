# Triplit Nuxt Module - Full Documentation

Complete documentation for @nuxtjs/triplit

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Composables](#composables)
4. [SSR Considerations](#ssr-considerations)
5. [Examples](#examples)
6. [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites

- Nuxt 4.x
- Node.js 16+
- Triplit account (or self-hosted server)

### Setup

```bash
npm install @nuxtjs/triplit @triplit/client
```

## Configuration

Add the module to `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/triplit'],
  
  triplit: {
    // Triplit server URL
    serverUrl: process.env.TRIPLIT_SERVER_URL,
    
    // Anonymous or service token
    token: process.env.TRIPLIT_TOKEN,
    
    // Storage mode: 'memory' | 'indexeddb' | { type: 'indexeddb', name: 'db-name' }
    storage: 'indexeddb',
    
    // Auto-connect on client initialization
    autoConnect: true,
  },
})
```

### Environment Variables

Use `NUXT_PUBLIC_` prefix to expose to browser:

```env
NUXT_PUBLIC_TRIPLIT_SERVER_URL=https://your-project.triplit.io
NUXT_PUBLIC_TRIPLIT_TOKEN=eyJhbGc...
```

## Composables

### useQuery

Subscribe to multiple entities matching a query.

**Parameters:**
- `query` - Triplit query object
- `options.syncStatus` - 'all' | 'synced' | 'pending' (optional)

**Returns:**
```typescript
{
  results: Ref<T[] | null>      // Array of entities
  fetching: Ref<boolean>         // Any fetching in progress
  fetchingLocal: Ref<boolean>    // Local cache fetch
  fetchingRemote: Ref<boolean>   // Remote sync fetch
  error: Ref<Error | null>       // Error if query failed
}
```

**Example:**

```vue
<script setup lang="ts">
const client = useTriplitClient()

const { results, fetching, error } = useQuery(
  client.query('todos')
    .Where('completed', '=', false)
    .Order('createdAt', 'DESC')
)
</script>

<template>
  <div>
    <div v-if="fetching">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <ul v-else>
      <li v-for="todo in results" :key="todo.id">
        {{ todo.text }}
      </li>
    </ul>
  </div>
</template>
```

### useQueryOne

Subscribe to a single entity.

**Parameters:**
- Same as `useQuery`

**Returns:**
```typescript
{
  result: Ref<T | null>          // Single entity (not array)
  fetching: Ref<boolean>
  fetchingLocal: Ref<boolean>
  fetchingRemote: Ref<boolean>
  error: Ref<Error | null>
}
```

**Example:**

```typescript
const { result: post, fetching } = useQueryOne(
  client.query('posts').Id('post-123')
)
```

### useConnectionStatus

Monitor connection status to Triplit server.

**Returns:**
```typescript
{
  status: Ref<'OPEN' | 'CLOSED' | 'CONNECTING'>
}
```

**Example:**

```vue
<script setup lang="ts">
const { status } = useConnectionStatus()
</script>

<template>
  <div>
    <span v-if="status === 'OPEN'" class="dot online"></span>
    <span v-else-if="status === 'CLOSED'" class="dot offline"></span>
    <span v-else class="dot connecting"></span>
  </div>
</template>
```

### useInsert

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

```vue
<script setup lang="ts">
const { insert, loading, error } = useInsert()

const handleAddTodo = async () => {
  try {
    await insert('todos', {
      text: 'Buy groceries',
      completed: false,
      createdAt: new Date(),
    })
  } catch (err) {
    console.error('Failed to add todo:', err)
  }
}
</script>

<template>
  <button @click="handleAddTodo" :disabled="loading">
    {{ loading ? 'Adding...' : 'Add Todo' }}
  </button>
  <div v-if="error" class="error">{{ error.message }}</div>
</template>
```

### useUpdate

Update existing entities.

**Parameters:**
- `collectionName` - Collection to update
- `entityId` - ID of entity to update
- `updateFn` - Function that modifies the entity

**Returns:**
```typescript
{
  update: (collectionName: string, entityId: string, updateFn: (entity: any) => Promise<void> | void) => Promise<void>
  loading: Ref<boolean>
  error: Ref<Error | null>
}
```

**Example:**

```typescript
const { update, loading } = useUpdate()

const handleToggleTodo = async (todoId: string) => {
  await update('todos', todoId, (entity) => {
    entity.completed = !entity.completed
  })
}
```

### useDelete

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
const { delete: deleteItem, loading } = useDelete()

const handleDeleteTodo = async (todoId: string) => {
  if (confirm('Delete this todo?')) {
    await deleteItem('todos', todoId)
  }
}
```

## SSR Considerations

### Automatic Handling

The module automatically detects the environment:

- **Server**: Uses HTTP client for one-time fetch
- **Client**: Uses WebSocket client for real-time updates

This means your components work seamlessly in both environments.

### Server Routes

For server-side operations:

```typescript
// server/api/batch-delete.ts
import { HttpClient } from '@triplit/client'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  const client = new HttpClient({
    serverUrl: config.triplit.serverUrl,
    token: config.triplit.token,
  })

  // Server-only operation
  const todos = await client.fetch(
    client.query('todos').Where('archived', '=', true)
  )

  for (const todo of todos) {
    await client.delete('todos', todo.id)
  }

  return { deleted: todos.length }
})
```

### Hydration Pattern

Data fetched on the server is automatically hydrated on the client:

```vue
<script setup lang="ts">
// Fetches on server, syncs on client
const { results } = useQuery(
  client.query('posts').Order('createdAt', 'DESC').Limit(10)
)
</script>

<!-- Data is available immediately -->
<template>
  <article v-for="post in results" :key="post.id">
    <h2>{{ post.title }}</h2>
    <p>{{ post.content }}</p>
  </article>
</template>
```

## Examples

### Complete Todo App

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { Entity } from '@triplit/client'
import { schema } from '~/triplit/schema'

type Todo = Entity<typeof schema, 'todos'>

const client = useTriplitClient()

const newTodoText = ref('')

const { results: todos, fetching } = useQuery<Todo>(
  client.query('todos').Order('createdAt', 'DESC')
)

const { insert } = useInsert()
const { update } = useUpdate()
const { delete: deleteItem } = useDelete()

const addTodo = async () => {
  if (!newTodoText.value.trim()) return
  
  await insert('todos', {
    text: newTodoText.value,
    completed: false,
    createdAt: new Date(),
  })
  
  newTodoText.value = ''
}

const toggleTodo = async (todo: Todo) => {
  await update('todos', todo.id, (entity) => {
    entity.completed = !todo.completed
  })
}

const removeTodo = async (id: string) => {
  await deleteItem('todos', id)
}
</script>

<template>
  <div class="todo-app">
    <h1>My Todos</h1>
    
    <div class="add-todo">
      <input
        v-model="newTodoText"
        @keyup.enter="addTodo"
        placeholder="Add a new todo..."
      />
      <button @click="addTodo">Add</button>
    </div>

    <div v-if="fetching" class="loading">Loading...</div>
    
    <ul v-else-if="todos" class="todo-list">
      <li v-for="todo in todos" :key="todo.id" :class="{ completed: todo.completed }">
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="toggleTodo(todo)"
        />
        <span>{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.todo-app {
  max-width: 500px;
  margin: 0 auto;
}

.add-todo {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.add-todo input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.todo-list li.completed span {
  text-decoration: line-through;
  color: #999;
}

.todo-list button {
  margin-left: auto;
  padding: 4px 8px;
  background: #f44;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

### Real-time Collaboration

```vue
<script setup lang="ts">
const { results: users } = useQuery(
  client.query('users').Where('isOnline', '=', true)
)

const { results: messages } = useQuery(
  client.query('messages').Order('createdAt', 'DESC').Limit(50)
)

const { insert } = useInsert()

const sendMessage = async (text: string) => {
  await insert('messages', {
    text,
    authorId: currentUser.value.id,
    createdAt: new Date(),
  })
}
</script>

<template>
  <div class="chat">
    <div class="users">
      <h3>Online Users ({{ users?.length || 0 }})</h3>
      <ul>
        <li v-for="user in users" :key="user.id">{{ user.name }}</li>
      </ul>
    </div>

    <div class="messages">
      <div v-for="msg in messages" :key="msg.id" class="message">
        <strong>{{ msg.authorName }}:</strong>
        <p>{{ msg.text }}</p>
        <time>{{ formatTime(msg.createdAt) }}</time>
      </div>
    </div>

    <form @submit.prevent="sendMessage">
      <input type="text" placeholder="Type a message..." />
    </form>
  </div>
</template>
```

## Troubleshooting

### Module not loading

Ensure `@nuxtjs/triplit` is in your `modules` array in `nuxt.config.ts`.

### Environment variables not set

Use `NUXT_PUBLIC_` prefix for browser-accessible variables:
- `NUXT_PUBLIC_TRIPLIT_SERVER_URL`
- `NUXT_PUBLIC_TRIPLIT_TOKEN`

### Data not appearing

1. Check that your query is correct
2. Verify the token has access to the data
3. Check the browser console for errors

### Connection status stuck on CONNECTING

Ensure the server URL is correct and accessible from your client.

### SSR data not hydrating

Make sure your composables are used inside `<script setup>` in components, not in parent layouts or middleware.

## License

MIT
