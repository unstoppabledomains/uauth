export default function objectFromEntries<T = any>(
  entries: Iterable<readonly [PropertyKey, T]>,
): Record<PropertyKey, T> {
  const object: Record<PropertyKey, T> = {}
  for (const [k, v] of entries) {
    object[k] = v
  }
  return object
}
