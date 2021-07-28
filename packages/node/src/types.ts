export interface Cache {
  set(key: string, value: string, ttl?: number): Promise<void>
  get(key: string): Promise<string | undefined>
}

export interface DomainResolver {
  records(domain: string, keys: string[]): Promise<string[]>
}

export interface IPFSResolver {
  resolve(cid: string, path: string): Promise<string>
}

export interface IPNSResolver {
  resolve(cid: string, path: string): Promise<string>
}
