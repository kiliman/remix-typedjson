import Decimal from 'decimal.js'
import {
  deserialize,
  registerCustomType,
  serialize,
  splitKey,
  stringify,
} from './typedjson'

describe('serialize and deserialize', () => {
  it('works for objects', () => {
    const obj = { 1: 5, 2: { 3: 'c' } }
    const { json, meta } = serialize(obj)
    expect(json).toEqual(JSON.stringify(obj))
    expect(meta).toBeUndefined()
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for nested arrays', () => {
    const obj = { data: [{ greeting: 'hello', today: new Date() }], counter: 1 }
    const { json, meta } = serialize(obj)
    expect(json).toEqual(JSON.stringify(obj))
    expect(meta).toEqual({ 'data.0.today': 'date' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('special case: objects with array-like keys', () => {
    const obj = { 0: 3, 1: 5, 2: { 3: 'c' } }
    const { json, meta } = serialize(obj)
    expect(json).toEqual(JSON.stringify(obj))
    expect(meta).toBeUndefined()
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for arrays', () => {
    const obj = [1, undefined, 2]
    const { json, meta } = serialize(obj)
    expect(json).toEqual(JSON.stringify(obj))
    expect(meta).toEqual({ '1': 'undefined' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for sets with serializable values', () => {
    const obj = {
      a: new Set([1, 2, 3]),
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"a":[1,2,3]}')
    expect(meta).toEqual({ a: 'set' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it.skip('works for sets with non-serializable values', () => {
    const obj = {
      a: new Set([1, undefined, 2, new Date(Date.UTC(2020, 0, 1))]),
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"a":[1,null,2,"2020-01-01T00:00:00.000Z"]}')
    expect(meta).toEqual({ a: 'set', 'a.1': 'undefined', 'a.3': 'date' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it.skip('works for top-level Sets', () => {
    const obj = new Set([1, undefined, 2])

    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it('works for simple Maps', () => {
    const obj = {
      a: new Map([
        ['key', 'value'],
        ['anotherkey', 'b'],
      ]),
      b: new Map([['2', 'b']]),
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual(
      JSON.stringify({ a: { key: 'value', anotherkey: 'b' }, b: { '2': 'b' } }),
    )
    expect(meta).toEqual({ a: 'map', b: 'map' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it.skip('works for complex Maps', () => {
    const obj = {
      a: new Map([
        [1, 'a'],
        [NaN, 'b'],
      ]),
      b: new Map([['2', 'b']]),
      d: new Map([[true, 'true key']]),
    }
    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it('works for paths containing dots', () => {
    const obj = {
      'a.1': {
        b: new Set([1, 2]),
      },
    }
    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it('works for paths containing backslashes', () => {
    const obj = {
      'a\\.1': {
        b: new Set([1, 2]),
      },
    }
    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it('works for Dates', () => {
    const obj = {
      meeting: {
        date: new Date(2020, 1, 1),
      },
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual(JSON.stringify(obj))
    expect(meta).toEqual({ 'meeting.date': 'date' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for Errors', () => {
    const obj = {
      e: new Error('epic fail'),
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual(
      JSON.stringify({
        e: { name: 'Error', message: 'epic fail', stack: obj.e.stack },
      }),
    )
    expect(meta).toEqual({ e: 'error' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result!.e instanceof Error).toBe(true)
    expect(result!.e.name).toBe('Error')
    expect(result!.e.message).toBe('epic fail')
  })
  it('works for regex', () => {
    const obj = { a: /hello/g }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"a":"/hello/g"}')
    expect(meta).toEqual({ a: 'regexp' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for Infinity', () => {
    const obj = {
      a: Number.POSITIVE_INFINITY,
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"a":"Infinity"}')
    expect(meta).toEqual({ a: 'infinity' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for -Infinity', () => {
    const obj = {
      a: Number.NEGATIVE_INFINITY,
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"a":"-Infinity"}')
    expect(meta).toEqual({ a: '-infinity' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for NaN', () => {
    const obj = { a: NaN }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"a":"NaN"}')
    expect(meta).toEqual({ a: 'nan' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for BigInt', () => {
    const obj = {
      a: BigInt('1021312312412312312313'),
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"a":"1021312312412312312313"}')
    expect(meta).toEqual({ a: 'bigint' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for undefined', () => {
    expect(deserialize(serialize(undefined)!)).toBeUndefined()
  })

  it('works for serialize output arguments', () => {
    const test = {
      bi: BigInt('1021312312412312312313'),
      nan: NaN,
      inf: {
        P: Number.POSITIVE_INFINITY,
        N: Number.NEGATIVE_INFINITY,
      },
      d: new Date(Date.UTC(1979, 0, 10)),
    }

    const strStd = stringify(test)
    const strDbg = stringify(test, null, 2)

    expect(strStd).toBe(
      '{"json":"{\\"bi\\":\\"1021312312412312312313\\",\\"nan\\":\\"NaN\\",\\"inf\\":{\\"P\\":\\"Infinity\\",\\"N\\":\\"-Infinity\\"},\\"d\\":\\"1979-01-10T00:00:00.000Z\\"}","meta":{"bi":"bigint","nan":"nan","inf.P":"infinity","inf.N":"-infinity","d":"date"}}',
    )
    expect(strDbg).toBe(`{
  "json": {
    "bi": "1021312312412312312313",
    "nan": "NaN",
    "inf": {
      "P": "Infinity",
      "N": "-Infinity"
    },
    "d": "1979-01-10T00:00:00.000Z"
  },
  "meta": {
    "bi": "bigint",
    "nan": "nan",
    "inf.P": "infinity",
    "inf.N": "-infinity",
    "d": "date"
  }
}`)
  })

  it('works for dotted properties', () => {
    const obj = {
      a: {
        string: '',
      },
      'b.c': {
        // If this is anything that needs special serialization, then it will break
        date: new Date(Date.UTC(2020, 0, 1)),
      },
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual(
      '{"a":{"string":""},"b.c":{"date":"2020-01-01T00:00:00.000Z"}}',
    )
    expect(meta).toEqual({ '[b.c].date': 'date' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
})
describe('custom types', () => {
  it('works for Decimal type', () => {
    registerCustomType({
      type: 'decimal',
      is: (value: unknown) => value instanceof Decimal,
      serialize: (value: Decimal) => value.toString(),
      deserialize: (value: string) => new Decimal(value),
    })

    const obj = {
      d: new Decimal('1234567890123456789012345678901234567890'),
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"d":"1.23456789012345678901234567890123456789e+39"}')
    expect(meta).toEqual({ d: 'decimal' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result?.d instanceof Decimal).toBe(true)
    expect(result).toEqual(obj)
  })
})

describe('helper functions', () => {
  it('splitKeys handles dotted properties', () => {
    const keys = splitKey('[b.c].d')
    console.log()
    expect(keys).toEqual(['b.c', 'd'])
  })
})
