type NonJsonTypes =
  | 'date'
  | 'set'
  | 'map'
  | 'regexp'
  | 'bigint'
  | 'undefined'
  | 'infinity'
  | '-infinity'
  | 'nan'
  | 'error'
type MetaType = Record<string, NonJsonTypes>
type EntryType = {
  type: NonJsonTypes | 'object'
  value: any
  count: number
  iteration: number
}
function serialize<T>(data: T): TypeJsonResult | null {
  if (data === null) return { json: 'null' }
  if (data === undefined) return { json: undefined }

  const stack: EntryType[] = []
  const keys: string[] = ['']
  const meta = new Map()
  function replacer(key: string, value: any) {
    let entry: EntryType | undefined
    if (stack.length) {
      entry = stack[stack.length - 1]
      entry.iteration++
      if (entry.iteration > entry.count) {
        if (entry.type === 'object') {
          keys.pop()
        }
        stack.pop()
        entry = stack[stack.length - 1]
        entry.iteration++
      }
    }
    if (entry) {
      value = entry.value[key]
    }
    let metaKey = `${keys[keys.length - 1]}${key}`
    const valueType = typeof value
    if (valueType === 'object' && value !== null) {
      let count = 0
      let t: NonJsonTypes | 'object' = 'undefined'
      if (value instanceof Date) {
        t = 'date'
        value = value.toISOString()
      } else if (value instanceof Set) {
        value = Array.from(value)
        count = value.length
        t = 'set'
      } else if (value instanceof Map) {
        value = Object.fromEntries(value)
        count = Object.keys(value).length
        t = 'map'
      } else if (value instanceof Array) {
        count = value.length
      } else if (value instanceof RegExp) {
        t = 'regexp'
        value = String(value)
      } else if (value instanceof Error) {
        t = 'error'
        value = { name: value.name, message: value.message, stack: value.stack }
        // push error value to stack
        stack.push({ type: 'object', value, count: 3, iteration: 0 })
      } else {
        count = Object.keys(value).length
        t = 'object'
      }
      if (t !== 'undefined' && t !== 'object') {
        meta.set(metaKey, t)
      }
      if (count !== 0) {
        stack.push({ type: t, value, count, iteration: 0 })
        if (key && t === 'object') {
          keys.push(`${metaKey}.`)
        }
        return value
      }
    }
    // handle non-object types
    if (valueType === 'bigint') {
      meta.set(metaKey, 'bigint')
      return String(value)
    }
    if (valueType === 'number') {
      if (value === Number.POSITIVE_INFINITY) {
        meta.set(metaKey, 'infinity')
        return 'Infinity'
      }
      if (value === Number.NEGATIVE_INFINITY) {
        meta.set(metaKey, '-infinity')
        return '-Infinity'
      }
      if (Number.isNaN(value)) {
        meta.set(metaKey, 'nan')
        return 'NaN'
      }
    }
    if (typeof value === 'undefined') {
      meta.set(metaKey, 'undefined')
      return null
    }
    return value
  }
  const json = JSON.stringify(data, replacer)
  return {
    json,
    meta: meta.size === 0 ? undefined : Object.fromEntries(meta.entries()),
  }
}

function deserialize<T>({ json, meta }: TypeJsonResult): T | null {
  if (!json) return null
  const result = JSON.parse(json)
  if (meta) {
    applyMeta(result, meta)
    return result as T
  }
  return result as T
}

function applyMeta<T>(data: T, meta: MetaType) {
  const keys = Object.keys(meta)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    applyConversion(data, key.split('.'), meta[key])
  }
  return data

  function applyConversion(
    data: any,
    keys: string[],
    type: NonJsonTypes,
    depth: number = 0,
  ) {
    const key = keys[depth]
    if (depth < keys.length - 1) {
      applyConversion(data[key], keys, type, depth + 1)
      return
    }
    const value = data[key]
    switch (type) {
      case 'date':
        data[key] = new Date(value)
        break
      case 'set':
        data[key] = new Set(value)
        break
      case 'map':
        data[key] = new Map(Object.entries(value))
        break
      case 'regexp':
        const match = /^\/(.*)\/([dgimsuy]*)$/.exec(value)
        if (match) {
          data[key] = new RegExp(match[1], match[2])
        } else {
          throw new Error(`Invalid regexp: ${value}`)
        }
        break
      case 'bigint':
        data[key] = BigInt(value)
        break
      case 'undefined':
        data[key] = undefined
        break
      case 'infinity':
        data[key] = Number.POSITIVE_INFINITY
        break
      case '-infinity':
        data[key] = Number.NEGATIVE_INFINITY
        break
      case 'nan':
        data[key] = NaN
        break
      case 'error':
        const err = new Error(value.message)
        err.name = value.name
        err.stack = value.stack
        data[key] = err
        break
    }
  }
}

type TypeJsonResult = {
  json?: string | null
  meta?: MetaType
}
function stringify<T>(data: T) {
  return JSON.stringify(serialize<T>(data))
}

function parse<T>(json: string) {
  const result: TypeJsonResult | null = JSON.parse(json)
  return result ? deserialize<T>(result) : null
}

const typedjson = {
  serialize,
  stringify,
  deserialize,
  parse,
  applyMeta,
}

export { serialize, deserialize, stringify, parse, applyMeta }
export type { MetaType, TypeJsonResult }
export default typedjson
