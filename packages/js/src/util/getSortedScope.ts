import uniqueElementsFromArray from './uniqueElementsFromArray'

const getSortedScope = (scope: string) =>
  uniqueElementsFromArray(scope.trim().split(/\s+/)).sort().join(' ')

export default getSortedScope
