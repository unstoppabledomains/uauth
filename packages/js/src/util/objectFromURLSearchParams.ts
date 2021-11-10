export default function objectFromURLSearchParams(
  params: URLSearchParams,
): Record<string, string | string[]> {
  const obj = {}

  params.forEach((_, key) => {
    if (params.getAll(key).length > 1) {
      obj[key] = params.getAll(key)
    } else {
      obj[key] = params.get(key)
    }
  })

  return obj
}
