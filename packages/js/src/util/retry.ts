function retry<T>(
  fn: () => Promise<T>,
  retries = 4,
  timeout = 250,
  factor = 2,
  err = null,
): Promise<T> {
  if (retries <= 0) {
    return Promise.reject(err)
  }

  return fn().catch(async err => {
    await new Promise(r => setTimeout(r, timeout))
    return retry(fn, retries - 1, timeout * factor, factor, err)
  })
}

export default retry
