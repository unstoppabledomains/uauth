import getWindow from '../getWindow'

const toBase64 = (str: string) => getWindow().btoa(str)

export default toBase64
