# @nuxtjs/triplit

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

SSR-ready Triplit composables for Nuxt 4.x. Seamlessly integrate real-time database syncing with full server-side rendering support.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)

## Features

- 🚀 SSR-ready composables (server & client)
- 🔄 Real-time data synchronization
- 📡 Automatic HTTP client fallback for SSR
- 🪝 Vue 3 composables API
- 💾 Offline support with IndexedDB
- ⚡ Full TypeScript support
- 🔗 Triplit integration with full schema support

## Quick Setup

Install the module to your Nuxt application:

```bash
npm install @nuxtjs/triplit @triplit/client
```

Add it to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/triplit'],
  triplit: {
    serverUrl: process.env.TRIPLIT_SERVER_URL,
    token: process.env.TRIPLIT_TOKEN,
    storage: 'indexeddb',
  },
})
```

Set your environment variables:

```env
NUXT_PUBLIC_TRIPLIT_SERVER_URL=https://your-project.triplit.io
NUXT_PUBLIC_TRIPLIT_TOKEN=your-anonymous-token
```

Now use the composables in your components:

```vue
<script setup lang="ts">
const { results: todos, fetching } = useQuery(
  client.query('todos').Where('completed', '=', false)
)
</script>
```

That's it! You can now use Triplit in your Nuxt app with full SSR support ✨


## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>


## Composables

### Data Fetching
- **`useQuery(query)`** - Subscribe to a query (multiple results)
- **`useQueryOne(query)`** - Subscribe to a single entity
- **`useConnectionStatus()`** - Monitor connection status

### Data Mutations
- **`useInsert()`** - Insert new entities
- **`useUpdate()`** - Update existing entities
- **`useDelete()`** - Delete entities

All composables are SSR-ready and handle server/client differences automatically.

## Documentation

For full documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md)

## Examples

### Basic Query

```typescript
const { results: posts, fetching } = useQuery(
  client.query('posts').Order('createdAt', 'DESC')
)
```

### With Insert

```typescript
const { insert, loading } = useInsert()

const handleCreate = async () => {
  await insert('posts', {
    title: 'New Post',
    content: 'Post content',
  })
}
```

### Monitoring Connection

```typescript
const { status } = useConnectionStatus()

// status is 'OPEN' | 'CLOSED' | 'CONNECTING'
```

## SSR Support

The module automatically:
- Uses HTTP client on the server for fast SSR
- Switches to WebSocket on the client for real-time updates
- Handles hydration seamlessly
- Supports offline-first patterns

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@nuxtjs/triplit/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@nuxtjs/triplit

[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxtjs/triplit.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@nuxtjs/triplit

[license-src]: https://img.shields.io/npm/l/@nuxtjs/triplit.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@nuxtjs/triplit

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
