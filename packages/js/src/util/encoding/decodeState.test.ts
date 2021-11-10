import decodeState from './decodeState'
import encodeState from './encodeState'

describe('util/encoding/decodeState', () => {
  it('should encode and decode strings correctly', () => {
    const str = String.fromCharCode(...new Array(1000).keys())
    const encoded = encodeState(str)
    expect(str).toBe(decodeState(encoded))
  })
})
