# remix-typedjson

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-9-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

This package is a replacement for [`superjson`](https://github.com/blitz-js/superjson) to use in your [Remix](https://remix.run/) app. It handles a subset
of types that `superjson` supports, but is faster and smaller.

NOTE: Although faster, `remix-typedjson` is nowhere near as flexible as `superjson`. It only supports a subset of types with no extensibility. If you need the advanced features of `superjson`, then I definitely recommend it.

Example site: https://remix-typedjson-example-production.up.railway.app/

Example repo: https://github.com/kiliman/remix-typedjson-example

The following types are supported:

- `Date`
- `BigInt`
- `Set`
- `Map`
- `RegExp`
- `undefined`
- `Error`
- `NaN`
- `Number.POSITIVE_INFINITY`
- `Number.NEGATIVE_INFINITY`

# 🚧 Work In Progress

Sets and Maps currently only support string keys and JSON serializable values. Complex types coming soon.

# 🛠 How to Use with Remix

In order to get full-type fidelity and type inference, you must be on Remix
v1.6.5+. You will also need to import the following replacement functions.

## `typedjson`

### Installation

```bash
npm i remix-typedjson
```

Replacement for Remix `json` helper. It also supports the optional `ResponseInit`, so you can return headers, etc.

Make sure your `loader` and `action` use the new declaration format:

```js
❌ export const loader: LoaderFunction = async ({request}) => {}
✅ export const loader = async ({request}: LoaderArgs) => {}
✅ export async function loader({request}: LoaderArgs) {}
```

### Usage

```js
return typedjson(
  { greeting: 'hello', today: new Date() },
  // ResponseInit is optional, just like the `json` helper
  { headers: { 'set-header': await commitSession(session) } },
)
```

## `useTypedLoaderData`

Replacement for Remix `useLoaderData`. Use the generic `<typeof loader>` to
get the correct type inference.

### Usage

```js
const loaderData = useTypedLoaderData<typeof loader>()
```

## `useTypedActionData`

Replacement for Remix `useActionData`. Use the generic `<typeof action>` to
get the correct type inference.

### Usage

```js
const actionData = useTypedActionData<typeof action>()
```

## `useTypedRouteLoaderData`

Helper for `useMatches` that returns the route data based on provided route `id`

### Usage

```ts
import { loader as rootLoader } from '~/root'

const rootData = useTypedRouteLoaderData<typeof rootLoader>('root')
```

## `useTypedFetcher`

Replacement for Remix `useFetcher`. Use the generic `<typeof loader|action>` to
get the correct type inference for the `fetcher.data` property.

### Usage

```js
const fetcher = useTypedFetcher<typeof action>()
fetcher.data // data property is fully typed
```

## `redirect`

In order to return a `redirect`, you will need to import the `redirect` function from this package, in order for the type inference to work properly.

However, you can also `throw redirect()` and you can use the original `redirect` function from Remix.

## `TypedMetaFunction`

You can now get typed arguments for both `data` and `parentsData` from your `meta`
function export. Based on [new feature coming to Remix](https://github.com/remix-run/remix/pull/4022)

```js
export const meta: TypedMetaFunction<typeof loader> = ({ data }) => {
  return {
    title: `Posts | ${data?.post.title}`,
  }
}
// for parentsData, you can specify a Record of typed loaders keyed by route id
// root.tsx
export LoaderType = typeof loader
// routes/parent.tsx
export LoaderType = typeof loader
// routes/child.tsx
import { type LoaderType as RootLoaderType } from '~/root'
import { type LoaderType as ParentLoaderType } from '~/routes/parent'

export const meta: TypedMetaFunction<
  typeof loader,
  // parent loader types keyed by route id
  {
    'root': RootLoader
    'routes/parent': ParentLoader
  }
> = ({ data, parentsData }) => {
  // access typed parent data by route id
  const rootData = parentsData['root']
  const parentData = parentsData['routes/parent']

  return {
    title: `Posts | ${data?.post.title}`,
  }
}
```

## 😍 Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://kiliman.dev/"><img src="https://avatars.githubusercontent.com/u/47168?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kiliman</b></sub></a><br /><a href="https://github.com/Kiliman/remix-typedjson/commits?author=kiliman" title="Code">💻</a> <a href="https://github.com/Kiliman/remix-typedjson/commits?author=kiliman" title="Documentation">📖</a></td>
    <td align="center"><a href="https://kentcdodds.com/"><img src="https://avatars.githubusercontent.com/u/1500684?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kent C. Dodds</b></sub></a><br /><a href="https://github.com/Kiliman/remix-typedjson/commits?author=kentcdodds" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Skn0tt"><img src="https://avatars.githubusercontent.com/u/14912729?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Simon Knott</b></sub></a><br /><a href="https://github.com/Kiliman/remix-typedjson/commits?author=Skn0tt" title="Code">💻</a> <a href="https://github.com/Kiliman/remix-typedjson/issues?q=author%3ASkn0tt" title="Bug reports">🐛</a> <a href="https://github.com/Kiliman/remix-typedjson/commits?author=Skn0tt" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/Tony-Truand"><img src="https://avatars.githubusercontent.com/u/7480192?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tony Truand</b></sub></a><br /><a href="https://github.com/Kiliman/remix-typedjson/commits?author=Tony-Truand" title="Code">💻</a> <a href="https://github.com/Kiliman/remix-typedjson/commits?author=Tony-Truand" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/ProdByGR"><img src="https://avatars.githubusercontent.com/u/29157049?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gregori Rivas</b></sub></a><br /><a href="https://github.com/Kiliman/remix-typedjson/commits?author=ProdByGR" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/glomyst"><img src="https://avatars.githubusercontent.com/u/5370064?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Afsah Nasir</b></sub></a><br /><a href="https://github.com/Kiliman/remix-typedjson/commits?author=glomyst" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/memark"><img src="https://avatars.githubusercontent.com/u/318504?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Magnus Markling</b></sub></a><br /><a href="https://github.com/Kiliman/remix-typedjson/commits?author=memark" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/joelazar"><img src="https://avatars.githubusercontent.com/u/16268238?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jozsef Lazar</b></sub></a><br /><a href="https://github.com/Kiliman/remix-typedjson/commits?author=joelazar" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/lukebowerman"><img src="https://avatars.githubusercontent.com/u/19156294?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Luke Bowerman</b></sub></a><br /><a href="https://github.com/Kiliman/remix-typedjson/commits?author=lukebowerman" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
