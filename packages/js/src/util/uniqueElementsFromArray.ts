export default function uniqueElementsFromArray<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}
