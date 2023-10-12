import {
  Await,
  HtmlMetaDescriptor,
  Params,
  useActionData,
  useFetcher,
  useLoaderData,
  useMatches,
  type FetcherWithComponents,
} from '@remix-run/react'
import { defer } from '@remix-run/server-runtime'

import type { MetaType } from './typedjson'
import * as _typedjson from './typedjson'

export type TypedJsonFunction = <Data extends unknown>(
  data: Data,
  init?: number | ResponseInit,
) => TypedJsonResponse<Data>

export declare type TypedJsonResponse<T extends unknown = unknown> =
  Response & {
    typedjson(): Promise<T>
    typeddefer(): Promise<T>
  }
export interface AppLoadContext {
  [key: string]: unknown
}
type AppData = any
type DataFunction = (...args: any[]) => unknown // matches any function
type DataOrFunction = AppData | DataFunction
export interface DataFunctionArgs {
  request: Request
  context: AppLoadContext
  params: Params
}
export type UseDataFunctionReturn<T extends DataOrFunction> = T extends (
  ...args: any[]
) => infer Output
  ? Awaited<Output> extends TypedJsonResponse<infer U>
    ? U
    : Awaited<ReturnType<T>>
  : Awaited<T>

export const typedjson: TypedJsonFunction = (data, init = {}) => {
  let responseInit = typeof init === 'number' ? { status: init } : init
  let headers = new Headers(responseInit.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json; charset=utf-8')
  }
  return new Response(stringifyRemix(data), {
    ...responseInit,
    headers,
  }) as TypedJsonResponse<typeof data>
}

export const typeddefer: TypedJsonFunction = (data, init = {}) => {
  // wrap any Promises in the data with new Promises that will serialize the
  // resolved data and add the meta to the response
  Object.entries(data as any).forEach(([key, value]) => {
    if (value instanceof Promise) {
      ;(data as any)[key] = value.then(resolvedData => {
        const { meta } = _typedjson.serialize(resolvedData)
        if (meta) {
          ;(resolvedData as any)['$$meta'] = meta
        }
        return resolvedData
      })
    } else {
      const { meta } = _typedjson.serialize(data)
      if (meta) {
        ;(data as any)['$$meta'] = meta
      }
    }
  })

  let responseInit = typeof init === 'number' ? { status: init } : init
  return defer(
    data as Record<string, unknown>,
    responseInit,
  ) as unknown as TypedJsonResponse<typeof data>
}

export type TypedAwaitProps<T> = {
  resolve: Promise<T>
  errorElement?: React.ReactNode
  children: (data: T) => React.ReactNode
}

export function TypedAwait<T>(props: TypedAwaitProps<T>) {
  if (!props.children) return null
  return (
    <Await {...props}>
      {data => {
        if (data === null) return null
        let deserializedData = deserializeRemix(data as any)
        return props.children(deserializedData)
      }}
    </Await>
  )
}

export function useTypedLoaderData<T = AppData>(): UseDataFunctionReturn<T> {
  const data = useLoaderData()
  return deserializeRemix<T>(
    data as RemixSerializedType<T>,
  ) as UseDataFunctionReturn<T>
}
export function useTypedActionData<
  T = AppData,
>(): UseDataFunctionReturn<T> | null {
  const data = useActionData()
  return deserializeRemix<T>(
    data as RemixSerializedType<T>,
  ) as UseDataFunctionReturn<T> | null
}

export type TypedFetcherWithComponents<T> = Omit<
  FetcherWithComponents<T>,
  'data'
> & {
  data: UseDataFunctionReturn<T>
}
export function useTypedFetcher<T>(): TypedFetcherWithComponents<T> {
  const fetcher = useFetcher()
  if (fetcher.data) {
    const newData = deserializeRemix<T>(fetcher.data as RemixSerializedType<T>)
    fetcher.data = newData ?? undefined
  }
  return fetcher as TypedFetcherWithComponents<T>
}

export function useTypedRouteLoaderData<T = AppData>(
  id: string,
): UseDataFunctionReturn<T> | undefined {
  const match = useMatches().find(match => match.id === id)
  if (!match) return undefined
  return deserializeRemix<T>(match.data as RemixSerializedType<T>) as
    | UseDataFunctionReturn<T>
    | undefined
}

export type RemixSerializedType<T> = {
  $$obj: T | null
  $$meta?: MetaType | null
} & (T | { $$meta?: MetaType })

export function stringifyRemix<T>(data: T) {
  // prevent double JSON stringification
  let { json, meta } = _typedjson.serialize(data)
  if (json && meta) {
    if (json.startsWith('{')) {
      json = `${json.substring(0, json.length - 1)},\"$$meta\":${JSON.stringify(
        meta,
      )}}`
    } else if (json.startsWith('[')) {
      json = `{"$$obj":${json},"$$meta":${JSON.stringify(meta)}}`
    }
  }
  return json
}

export function deserializeRemix<T>(data: RemixSerializedType<T>): T | null {
  if (!data) return data
  if (data.$$obj) {
    // handle arrays wrapped in an object
    return data.$$meta
      ? _typedjson.applyMeta<T>(data.$$obj, data.$$meta)
      : data.$$obj
  } else if (data.$$meta) {
    // handle object with $$meta key
    // remove before applying meta
    const meta = data.$$meta
    delete data.$$meta
    return _typedjson.applyMeta<T>(data as T, meta)
  }
  return data as T
}

export type RedirectFunction = (
  url: string,
  init?: number | ResponseInit,
) => TypedJsonResponse<never>

/**
 * A redirect response. Sets the status code and the `Location` header.
 * Defaults to "302 Found".
 *
 * @see https://remix.run/api/remix#redirect
 */
export const redirect: RedirectFunction = (url, init = 302) => {
  let responseInit = init
  if (typeof responseInit === 'number') {
    responseInit = { status: responseInit }
  } else if (typeof responseInit.status === 'undefined') {
    responseInit.status = 302
  }

  let headers = new Headers(responseInit.headers)
  headers.set('Location', url)

  return new Response(null, {
    ...responseInit,
    headers,
  }) as TypedJsonResponse<never>
}
export interface RouteData {
  [routeId: string]: AppData
}

export interface LoaderFunction {
  (args: DataFunctionArgs):
    | Promise<Response>
    | Response
    | Promise<AppData>
    | AppData
}
export interface TypedMetaFunction<
  Loader extends LoaderFunction | unknown = unknown,
  ParentsLoaders extends Record<string, LoaderFunction> = {},
> {
  (args: {
    data: Loader extends LoaderFunction
      ? UseDataFunctionReturn<Loader>
      : AppData
    parentsData: {
      [k in keyof ParentsLoaders]: UseDataFunctionReturn<ParentsLoaders[k]>
    } & RouteData
    params: Params
    location: Location
  }): HtmlMetaDescriptor
}
