import window from 'global'

const getWindow: () => Window & typeof globalThis = () => window

export default getWindow
