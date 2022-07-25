import { useActionData, useLoaderData } from '@remix-run/react'
import * as _typedjson from './typedjson'

export type TypedJsonFunction = <Data extends unknown>(
  data: Data,
  init?: number | ResponseInit,
) => TypedJsonResponse<Data>

export declare type TypedJsonResponse<T extends unknown = unknown> =
  Response & {
    typedjson(): Promise<T>
  }

type AppData = any
type DataFunction = (...args: any[]) => unknown // matches any function
type DataOrFunction = AppData | DataFunction

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
  return new Response(_typedjson.stringify(data), {
    ...responseInit,
    headers,
  }) as TypedJsonResponse<typeof data>
}

export function useTypedLoaderData<T = AppData>(): UseDataFunctionReturn<T> {
  const data = useLoaderData()
  return _typedjson.parse<T>(data)
}
export function useTypedActionData<
  T = AppData,
>(): UseDataFunctionReturn<T> | null {
  const data = useActionData()
  return _typedjson.parse<T>(data)
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
