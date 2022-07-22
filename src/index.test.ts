import { deserialize, serialize } from './index'

describe('serialize and deserialize', () => {
  it('works for objects', () => {
    const obj = { 1: 5, 2: { 3: 'c' } }
    const { json, meta } = serialize(obj)
    const result = deserialize({ json, meta })
    expect(result).toEqual(obj)
  })
  it('special case: objects with array-like keys', () => {
    const obj = { 0: 3, 1: 5, 2: { 3: 'c' } }
    const { json, meta } = serialize(obj)
    const result = deserialize({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for arrays', () => {
    const obj = [1, undefined, 2]
    const { json, meta } = serialize(obj)
    const result = deserialize({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for sets', () => {
    const obj = {
      a: new Set([1, undefined, 2]),
    }
    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it('works for top-level Sets', () => {
    const obj = new Set([1, undefined, 2])

    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it('works for Maps', () => {
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
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it('works for Errors', () => {
    const obj = {
      e: new Error('epic fail'),
    }
    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it('works for regex', () => {
    const obj = { a: /hello/g }
    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it('works for Infinity', () => {
    const obj = {
      a: Number.POSITIVE_INFINITY,
    }
    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it('works for -Infinity', () => {
    const obj = {
      a: Number.NEGATIVE_INFINITY,
    }
    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it('works for NaN', () => {
    const obj = { a: NaN }
    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it('works for BigInt', () => {
    const obj = {
      a: BigInt('1021312312412312312313'),
    }
    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
})
