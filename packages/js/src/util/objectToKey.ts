export default function objectToKey(object: Record<PropertyKey, any>): string {
  const params = new URLSearchParams(
    [...Object.entries(object)].filter(([k, v]) => k != null && v != null),
  )
  params.sort()
  return params.toString()
}
