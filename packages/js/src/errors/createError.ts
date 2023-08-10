export default function createError(
  errorName: string,
  message: string,
  errorCode = 'E1000',
) {
  return class extends Error {
    name = `${errorCode} ${errorName}`
    constructor() {
      super(message)
    }
  }
}
