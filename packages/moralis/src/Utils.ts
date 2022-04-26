/**
 * Converts chainId to a hex if it is a number
 */
function verifyChainId(chainId) {
  if (typeof chainId === 'number') chainId = fromDecimalToHex(chainId)
  return chainId
}

function fromDecimalToHex(number) {
  if (typeof number !== 'number') throw 'The input provided should be a number'
  return `0x${number.toString(16)}`
}

export default verifyChainId
