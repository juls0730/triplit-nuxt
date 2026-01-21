# Changelog

## 🚧 v0.3.1-prerelease.0

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.3.0a...v0.3.1-prerelease.0)

### ⚡️ Performance

- Use the undocumented subscribeWithStatus method to subscribe to queries, 
  without pre-fetching data, but still preventing empty data from being returned.
  This halves the number of requests made to the triplit server from the client,
  but I am not entirely confident in this change, thsu why I am releasing it as
  a prerelease.

## v0.3.0a

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.3.0...v0.3.0a)

### 🩹 Fixes

- Add ComputedRef to useQuery's query argument type
- Update README

## v0.3.0

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.2.2...v0.3.0)

### 💥 Breaking Changes

- remove useQueryOne. If you want to achieve the functionality of useQueryOne, use useQuery, and add .Limit(1) to the query

### ✨ New Features

- useQuery can now take in a reactive query! This means you can now use useQuery with reactive queries, and when the query changes, the data will be updated
  Example:
  ```ts
  const route = useRoute()
  const topicId = computed(() => route.params.topicId)
  const query = computed(() => client.query('todos').Where('id', '=', topicId))
  // when topicId changes, the data will be updated!
  const { results: todos, fetching } = useQuery('todos', client, query)
  ```

## v0.2.1

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.2.0...v0.2.1)

### 🧑‍💻 DX Changes

- Add an error message when using a non-anonymous token, and add a config option to skip this error

## v0.2.0

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.1.10...v0.2.0)

### 💥 Breaking Changes

- query composables now use a key in order to properly sync state between the server and client
- query composables now return an unsubscribe function, it is your responsibility to call it when the component is unmounted

## v0.1.10

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.1.9...v0.1.10)

### 🏡 Chore

- Remove non-functional warning suppressing code ([4554de2](https://github.com/juls0730/triplit-nuxt/commit/4554de2))

### ❤️ Contributors

- Zoe ([@juls0730](https://github.com/juls0730))

## v0.1.9

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.1.8...v0.1.9)

### 🩹 Fixes

- Use onScopeDispose instead of onUnmount, and hide warning about HttpClient ([5df20f2](https://github.com/juls0730/triplit-nuxt/commit/5df20f2))

### ❤️ Contributors

- Zoe ([@juls0730](https://github.com/juls0730))

## v0.1.8

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.1.7...v0.1.8)

### 🩹 Fixes

- Actually fix bundling ([9ba1085](https://github.com/juls0730/triplit-nuxt/commit/9ba1085))

### ❤️ Contributors

- Zoe ([@juls0730](https://github.com/juls0730))

## v0.1.7

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.1.6...v0.1.7)

### 🩹 Fixes

- Fix bundling (hopefully) (hopefully) ([46e9576](https://github.com/juls0730/triplit-nuxt/commit/46e9576))

### ❤️ Contributors

- Zoe ([@juls0730](https://github.com/juls0730))

## v0.1.6

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.1.5...v0.1.6)

### 🩹 Fixes

- Fix bundling (hopefully) ([ce912b0](https://github.com/juls0730/triplit-nuxt/commit/ce912b0))

### ❤️ Contributors

- Zoe ([@juls0730](https://github.com/juls0730))

## v0.1.5

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.1.4...v0.1.5)

### 🩹 Fixes

- Actually fix types (hopefully) ([fce04c7](https://github.com/juls0730/triplit-nuxt/commit/fce04c7))

### ❤️ Contributors

- Zoe ([@juls0730](https://github.com/juls0730))

## v0.1.4

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.1.3...v0.1.4)

### 🩹 Fixes

- Fix bugs, add license, and other stuff ([fa056e4](https://github.com/juls0730/triplit-nuxt/commit/fa056e4))
- Fix types hopefully ([6be308a](https://github.com/juls0730/triplit-nuxt/commit/6be308a))

### 🏡 Chore

- **release:** V0.1.1 ([170cc79](https://github.com/juls0730/triplit-nuxt/commit/170cc79))
- **release:** V0.1.2 ([19c6214](https://github.com/juls0730/triplit-nuxt/commit/19c6214))
- **release:** V0.1.3 ([670e362](https://github.com/juls0730/triplit-nuxt/commit/670e362))
- **release:** V0.1.3 ([4fc3717](https://github.com/juls0730/triplit-nuxt/commit/4fc3717))

### ❤️ Contributors

- Zoe ([@juls0730](https://github.com/juls0730))

## v0.1.3

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.1.3...v0.1.3)

### 🩹 Fixes

- Fix bugs, add license, and other stuff ([fa056e4](https://github.com/juls0730/triplit-nuxt/commit/fa056e4))
- Fix types hopefully ([6be308a](https://github.com/juls0730/triplit-nuxt/commit/6be308a))

### 🏡 Chore

- **release:** V0.1.1 ([170cc79](https://github.com/juls0730/triplit-nuxt/commit/170cc79))
- **release:** V0.1.2 ([19c6214](https://github.com/juls0730/triplit-nuxt/commit/19c6214))
- **release:** V0.1.3 ([670e362](https://github.com/juls0730/triplit-nuxt/commit/670e362))

### ❤️ Contributors

- Zoe ([@juls0730](https://github.com/juls0730))

## v0.1.3

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.1.3...v0.1.3)

### 🩹 Fixes

- Fix bugs, add license, and other stuff ([fa056e4](https://github.com/juls0730/triplit-nuxt/commit/fa056e4))
- Fix types hopefully ([6be308a](https://github.com/juls0730/triplit-nuxt/commit/6be308a))

### 🏡 Chore

- **release:** V0.1.1 ([170cc79](https://github.com/juls0730/triplit-nuxt/commit/170cc79))
- **release:** V0.1.2 ([19c6214](https://github.com/juls0730/triplit-nuxt/commit/19c6214))

### ❤️ Contributors

- Zoe ([@juls0730](https://github.com/juls0730))

## v0.1.2

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.1.3...v0.1.2)

### 🩹 Fixes

- Fix bugs, add license, and other stuff ([fa056e4](https://github.com/juls0730/triplit-nuxt/commit/fa056e4))

### 🏡 Chore

- **release:** V0.1.1 ([170cc79](https://github.com/juls0730/triplit-nuxt/commit/170cc79))

### ❤️ Contributors

- Zoe ([@juls0730](https://github.com/juls0730))

## v0.1.1

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.1.3...v0.1.1)

## v0.1.3

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.1.2...v0.1.3)

## v0.1.2

[compare changes](https://github.com/juls0730/triplit-nuxt/compare/v0.1.1...v0.1.2)

## v0.1.1


### 🚀 Enhancements

- Add SSR-ready Triplit composables for Nuxt ([49b0766](https://github.com/your-org/my-module/commit/49b0766))
- Add useTriplitClient composable ([c7e593e](https://github.com/your-org/my-module/commit/c7e593e))

### 🩹 Fixes

- Add missing imports to make the LSP shut up ([65c647d](https://github.com/your-org/my-module/commit/65c647d))

### 📖 Documentation

- Add comprehensive implementation summary ([5509ca0](https://github.com/your-org/my-module/commit/5509ca0))
- Add quick start reference guide ([3ca63ae](https://github.com/your-org/my-module/commit/3ca63ae))
- Add complete module summary ([9a7ed7a](https://github.com/your-org/my-module/commit/9a7ed7a))
- Add complete API reference ([c9c655f](https://github.com/your-org/my-module/commit/c9c655f))
- Add documentation index guide ([0ac735e](https://github.com/your-org/my-module/commit/0ac735e))

### ❤️ Contributors

- Zoe ([@juls0730](https://github.com/juls0730))

