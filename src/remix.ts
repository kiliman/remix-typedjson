import {
  HtmlMetaDescriptor,
  Params,
  useActionData,
  useFetcher,
  useLoaderData,
  type FetcherWithComponents,
} from '@remix-run/react'

import type { MetaType } from './typedjson'
import * as _typedjson from './typedjson'

export type TypedJsonFunction = <Data extends unknown>(
  data: Data,
  init?: number | ResponseInit,
) => TypedJsonResponse<Data>

export declare type TypedJsonResponse<T extends unknown = unknown> =
  Response & {
    typedjson(): Promise<T>
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
  const fetcher = useFetcher<T>()
  if (fetcher.data) {
    const newData = deserializeRemix<T>(fetcher.data as RemixSerializedType<T>)
    fetcher.data = newData ?? undefined
  }
  return fetcher as TypedFetcherWithComponents<T>
}

export type RemixSerializedType<T> = {
  __obj__: T | null
  __meta__?: MetaType | null
} & (T | { __meta__?: MetaType })

export function stringifyRemix<T>(data: T) {
  // prevent double JSON stringification
  let { json, meta } = _typedjson.serialize(data)
  if (json && meta) {
    if (json.startsWith('{')) {
      json = `${json.substring(
        0,
        json.length - 1,
      )},\"__meta__\":${JSON.stringify(meta)}}`
    } else if (json.startsWith('[')) {
      json = `{"__obj__":${json},"__meta__":${JSON.stringify(meta)}}`
    }
  }
  return json
}

export function deserializeRemix<T>(data: RemixSerializedType<T>): T | null {
  if (!data) return data
  if (data.__obj__) {
    // handle arrays wrapped in an object
    return data.__meta__
      ? _typedjson.applyMeta<T>(data.__obj__, data.__meta__)
      : data.__obj__
  } else if (data.__meta__) {
    // handle object with __meta__ key
    // remove before applying meta
    const meta = data.__meta__
    delete data.__meta__
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
