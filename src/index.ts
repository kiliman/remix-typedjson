type EntryType = {
  type: string
  value: any
  count: number
  iteration: number
}
function serialize(data: any) {
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
      let t = ''
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
      } else {
        count = Object.keys(value).length
        t = 'object'
      }
      if (t !== undefined && t !== 'object') {
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
  return { json, meta: Object.fromEntries(meta.entries()) }
}

function deserialize({
  json,
  meta,
}: {
  json: string
  meta: Record<string, string>
}) {
  const result = JSON.parse(json)
  const keys = Object.keys(meta)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    applyConversion(result, key.split('.'), meta[key])
  }
  function applyConversion(
    result: any,
    keys: string[],
    type: string,
    depth: number = 0,
  ) {
    const key = keys[depth]
    if (depth < keys.length - 1) {
      applyConversion(result[key], keys, type, depth + 1)
      return
    }
    const value = result[key]
    switch (type) {
      case 'date':
        result[key] = new Date(value)
        break
      case 'set':
        result[key] = new Set(value)
        break
      case 'map':
        result[key] = new Map(Object.entries(value))
        break
      case 'regexp':
        const match = /^\/(.*)\/([dgimsuy]*)$/.exec(value)
        if (match) {
          result[key] = new RegExp(match[1], match[2])
        } else {
          throw new Error(`Invalid regexp: ${value}`)
        }
        break
      case 'bigint':
        result[key] = BigInt(value)
        break
      case 'undefined':
        result[key] = undefined
        break
      case 'infinity':
        result[key] = Number.POSITIVE_INFINITY
        break
      case '-infinity':
        result[key] = Number.NEGATIVE_INFINITY
        break
      case 'nan':
        result[key] = NaN
        break
    }
  }
  return result
}

const typedjson = {
  serialize,
  deserialize,
}
export { serialize, deserialize }
export default typedjson
