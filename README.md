# triplit-nuxt

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

> [!NOTE]
> This module was written in a few hours with the help of LLMs. I have, of
> course, put my own effort into fixing the crap that was generated, and I am
> actively using this module. I think I will _soon_ have a blog about my
> thoughts and experiences with AI assisted code generation, so stay tuned!
> Also, if you encounter any bugs or issues, please open an issue on GitHub,
> DM me on twitter (@julie4055\_) or email me (juls07@juls07.dev).

SSR-ready Triplit composables for Nuxt 4.x. Seamlessly integrate real-time
database syncing with full server-side rendering support.

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
npm install triplit-nuxt @triplit/client
```

Add it to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ["triplit-nuxt"],
});
```

> [!NOTE]
> Unfortunately, you will see a warning in the console that "HttpClient" is 
> imported from external module. As far as I know, this is because of triplit,
> and has nothing to do with me, and as far as I know, there is nothing I can
> do about it. I will try to fix this in the future, if you know a fix, please
> make a PR!

Set your environment variables:

```env
NUXT_PUBLIC_TRIPLIT_SERVER_URL=https://your-project.triplit.io
NUXT_ANON_TRIPLIT_TOKEN=your-anonymous-token
```

Now use the composables in your components:

```vue
<script setup lang="ts">
const client = useTriplitClient();
const { results: todos, fetching } = useQuery(
  'todos'.
  client,
  client.query("todos").Where("completed", "=", false)
);
</script>
```

That's it! You can now use Triplit in your Nuxt app with full SSR support ✨

## Configuration

You can configure the module in your `nuxt.config.ts`. The following options are available:

- **`serverUrl`** - The URL of your Triplit server (required, can be set with `NUXT_PUBLIC_TRIPLIT_SERVER_URL` env var)
- **`token`** - The token for your project (required, can be set with `NUXT_ANON_TRIPLIT_TOKEN` env var)
- **`schema_path`** - The path to your schema file (default: `./triplit/schema.ts`)
- **`storage`** - The storage to use (default: `indexeddb`, either `memory` or `indexeddb`)
- **`autoConnect`** - Automatically connect to the server on startup (default: `true`)

## Contribution

<details>
<summary>Local development</summary>
  
```bash
# Install dependencies
npm install
  
# Generate type stubs
npm run dev:prepare
```

</details>

## Composables

### Client

- **`useTriplitClient()`** - Get the Triplit client instance

### Data Fetching

- **`useQuery('key', triplit, triplit.query('table))`** - Subscribe to a query (multiple results)
- **`useConnectionStatus()`** - Monitor connection status

All composables are SSR-ready and handle server/client differences automatically.

## Examples

<!-- TODO: way better docs on something like a https://auth.sidebase.io/ -->

There is a full example in the [playground](https://github.com/triplit/triplit-nuxt/tree/trunk/playground) folder.
All you need to do is start the triplit server (`npm run triplit`) run
`npm run dev` and open `http://localhost:3000` in your browser.

### Basic Query

```typescript
const client = useTriplitClient();
const { results: posts, fetching, unsubscribe } = useQuery(
    'posts',
  client,
  client.query("posts").Order("createdAt", "DESC")
);

onUnmounted(() => {
  unsubscribe?.();
});
```

### With a reactive query

```typescript
const route = useRoute()
const topicId = computed(() => route.params.topicId)
const query = computed(() => client.query('todos').Where('id', '=', topicId))
const { results: todos, fetching } = useQuery('todos', client, query)
```

### With Insert

```typescript
const client = useTriplitClient();

const handleCreate = async () => {
  await client.insert("posts", {
    title: "New Post",
    content: "Post content",
  });
};
```

### Monitoring Connection

```typescript
const { status, unsubscribe } = useConnectionStatus();

onUnmounted(() => {
  unsubscribe?.();
});

// status is 'OPEN' | 'CLOSED' | 'CONNECTING'
```

## SSR Support

The module automatically:

- Uses HTTP client on the server for fast SSR
- Switches to WebSocket on the client for real-time updates
- Handles hydration seamlessly
- Supports offline-first patterns

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/triplit-nuxt/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/triplit-nuxt
[npm-downloads-src]: https://img.shields.io/npm/dm/triplit-nuxt.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/triplit-nuxt
[license-src]: https://img.shields.io/npm/l/triplit-nuxt.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/triplit-nuxt
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
