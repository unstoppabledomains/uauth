import {Cache} from './types'

export default class MemoryCache extends Map<string, string> implements Cache {}
