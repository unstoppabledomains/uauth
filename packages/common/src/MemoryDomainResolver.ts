import {DomainResolver} from './types'

export default class MemoryDomainResolver implements DomainResolver {
  private map: Map<string, Record<string, string>> = new Map()

  set(domain: string, records: Record<string, string>): void {
    if (!this.map.has(domain)) {
      this.map.set(domain, records)
      return
    }

    this.map.set(domain, {...this.map.get(domain), ...records})
  }

  records = async (
    domain: string,
    keys: string[],
  ): Promise<Record<string, string>> => {
    const records = this.map.get(domain)

    if (keys.length === 0) {
      throw new Error('no keys')
    }

    if (!records) {
      return {}
    }

    return keys.reduce((a, v) => {
      a[v] = records[v] || ''
      return a
    }, {})
  }
}
