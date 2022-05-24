import decodeState from './decodeState'
import encodeState from './encodeState'

describe('util/encoding/decodeState', () => {
  it('should work', () => {
    expect.hasAssertions()
    expect('it').toBe('it')
  })

  it.todo('should encode and decode strings correctly', () => {
    expect.hasAssertions()

    const str = String.fromCharCode(...new Array(1000).keys())
    const encoded = encodeState(str)
    expect(str).toBe(decodeState(encoded))
  })
})
