function createCustomError(name: string, message?: string) {
  return class extends Error {
    constructor() {
      super(message)
      this.name = name
    }
  }
}
