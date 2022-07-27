import { deserializeRemix, stringifyRemix } from './remix'

describe('stringify Remix data', () => {
  it('works for JSON only objects', () => {
    const obj = { 1: 5, 2: { 3: 'c' } }
    const json = stringifyRemix(obj)
    expect(json).toEqual(JSON.stringify(obj))
  })
  it('works for objects with meta', () => {
    const obj = { message: 'hello', date: new Date(Date.UTC(2020, 0, 1)) }
    const json = stringifyRemix(obj)
    expect(json).toEqual(
      '{"message":"hello","date":"2020-01-01T00:00:00.000Z","__meta__":{"date":"date"}}',
    )
  })
  it('works for arrays', () => {
    const arr = [
      { message: 'hello', bigint: BigInt(1) },
      { message: 'world', bigint: BigInt(2) },
    ]
    const json = stringifyRemix(arr)
    expect(json).toEqual(
      '{"__obj__":[{"message":"hello","bigint":"1"}' +
        ',{"message":"world","bigint":"2"}],' +
        '"__meta__":{"0.bigint":"bigint","1.bigint":"bigint"}}',
    )
  })
})
describe('deserialize Remix data', () => {
  it('works for JSON only objects', () => {
    const obj = { 1: 5, 2: { 3: 'c' } }
    const json = stringifyRemix(obj)
    const parsed = JSON.parse(json!)
    const data = deserializeRemix(parsed)
    expect(data).toEqual(obj)
  })
  it('works for objects with meta', () => {
    const obj = { message: 'hello', date: new Date(Date.UTC(2020, 0, 1)) }
    const json = stringifyRemix(obj)
    const parsed = JSON.parse(json!)
    const data = deserializeRemix(parsed)
    expect(data).toEqual(obj)
  })
  it('works for nested objects with meta', () => {
    const obj = {
      data: { message: 'hello', date: new Date(Date.UTC(2020, 0, 1)) },
    }
    const json = stringifyRemix(obj)
    const parsed = JSON.parse(json!)
    const data = deserializeRemix(parsed)
    expect(data).toEqual(obj)
  })
  it('works for nested arrays with meta', () => {
    const obj = {
      data: [{ message: 'hello', date: new Date(Date.UTC(2020, 0, 1)) }],
    }
    const json = stringifyRemix(obj)
    const parsed = JSON.parse(json!)
    const data = deserializeRemix(parsed)
    expect(data).toEqual(obj)
  })
  it('works for arrays', () => {
    const arr = [
      { message: 'hello', bigint: BigInt(1) },
      { message: 'world', bigint: BigInt(2) },
    ]
    const json = stringifyRemix(arr)
    const parsed = JSON.parse(json!)
    const data = deserializeRemix(parsed)
    expect(data).toEqual(arr)
  })
})
