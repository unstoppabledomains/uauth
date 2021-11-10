export default function createError(name: string, message: string) {
  return class extends Error {
    name = name
    constructor() {
      super(message)
    }
  }
}
