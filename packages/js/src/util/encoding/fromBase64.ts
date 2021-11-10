import getWindow from '../getWindow'

const fromBase64 = (str: string): string => getWindow().atob(str)

export default fromBase64
