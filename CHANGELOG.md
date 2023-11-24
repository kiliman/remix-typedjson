# CHANGELOG

## 🚀 v0.4.1

- ↩️ Restore missing Remix peer dependencies [#37](https://github.com/kiliman/remix-typedjson/issues/37)

## 🚀 v0.4.0

- ✨ Add support for `key` in `useTypedFetcher` [#35](https://github.com/kiliman/remix-typedjson/issues/35)
- 🔥 Deprecate `TypedMetaFunction` since it didn't work anyway

## 🚀 v0.3.1

- 🐛 Add support for dotted properties in serialized object [#22](https://github.com/kiliman/remix-typedjson/issues/22)

## 🚀 v0.3.0

- ✨ Add support for `typeddefer` and `<TypedAwait>` [#20](https://github.com/kiliman/remix-typedjson/issues/20)

## 🚀 v0.2.2

- 📦 Fix peer dependency to support Remix v2

## 🚀 v0.2.1

- 📦 Update peer dependency to support Remix v2

## 🚀 v0.2.0

- ✨ Add `registerCustomType` API

## 🚀 v0.1.7

- ✨ Add `useTypedRouteLoaderData`
- 🔨 Export `UseDataFunctionReturn` & `RemixSerializedType` types [#19](https://github.com/kiliman/remix-typedjson/pull/19)

## 🚀 v0.1.6

📦 - Republish package due to incorrect build

## 🚀 v0.1.5

- 🔨 Export TypedFetcherWithComponents type [#17](https://github.com/kiliman/remix-typedjson/pull/17)

## 🚀 v0.1.4

- 🔥 Remove `importHelpers: true` in tsconfig.json

## 🚀 v0.1.3

- 📦 Fixup package versions

## 🚀 v0.1.2

- 🔨 Export TypedJsonResponse type [#10](https://github.com/kiliman/remix-typedjson/issues/10)

## 🚀 v0.1.1

- 🔨 Update peer dependencies for React 18 [#9](https://github.com/kiliman/remix-typedjson/pull/9)

## 🚀 v0.1.0

- ✨ Add `TypedMetaFunction` support [#6](https://github.com/kiliman/remix-typedjson/issue/6)

- 🐛 Fix peer dependencies [#7](https://github.com/kiliman/remix-typedjson/issues/7)

## 🚀 v0.0.9

- ✨ Handle JSON.stringify standard arguments [#8](https://github.com/kiliman/remix-typedjson/pull/9)

## 🚀 v0.0.8

- 🐛 Fix stack unwinding resulting in incorrect meta [#4](https://github.com/kiliman/remix-typedjson/issues/4)
- 🔨 Update `serialize` return value to always return `TypedJsonResult`

## 🚀 v0.0.7

- 🐛 Correctly deserialize `undefined` [#3](https://github.com/kiliman/remix-typedjson/pull/3)
- 🐛 Fix serialize meta of nested arrays [#2](https://github.com/kiliman/remix-typedjson/issues/2)

## 🚀 v0.0.6

- 🐛 Fix typo in TypedJsonResult type
- 🔨 Replace wildcard export with specific items

## 🚀 v0.0.5

- 🐛 Fix stringifying/parsing Remix data and add tests

## 🚀 v0.0.4

- 🐛 Fix Remix stringification of `__meta__`

## 🚀 v0.0.3

- 🔨 Include `*.d.ts` files in package

## 🚀 v0.0.2

- ✨ Add Remix replacements for typed loaders, actions, and fetchers

## 🚀 v0.0.1

- 🎉 Intial version
