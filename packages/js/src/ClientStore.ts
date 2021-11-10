import {AuthorizeRequest, LogoutRequest} from './api'
import type Client from './Client'
import {Authorization, AuthorizationOptions} from './types'
import * as util from './util'

class ClientStore {
  constructor(public client: Client) {}

  private async get<T>(
    key: string,
    {mustExist = false, deleteAfter = false} = {},
  ): Promise<T | undefined> {
    const entry = await this.client.store.get(key)
    if (entry == null) {
      if (mustExist) {
        throw new Error(`${key} does not exist in store`)
      }
      return
    }

    const {value, expiresAt} = entry
    if (expiresAt !== 0 && expiresAt < Date.now()) {
      await this.client.store.delete(key)
      if (mustExist) {
        throw new Error(`${key} does not exist in store`)
      }
      return
    }

    if (deleteAfter) {
      await this.client.store.delete(key)
    }

    return value
  }

  private async set<T>(key: string, value: any, timeout = 0) {
    await this.client.store.set(key, {
      expiresAt: timeout === 0 ? 0 : Date.now() + timeout,
      value,
    })
  }

  async setAuthorizeRequest(request: AuthorizeRequest): Promise<void> {
    await this.set('request', request, 300_000 /* 5 minutes */)
  }
  getAuthorizeRequest(): Promise<AuthorizeRequest> {
    return this.get<AuthorizeRequest>('request', {
      mustExist: true,
      deleteAfter: true,
    }) as Promise<AuthorizeRequest>
  }

  async setLogoutRequest(request: LogoutRequest): Promise<void> {
    await this.set('logout-request', request, 300_000 /* 5 minutes */)
  }
  getLogoutRequest(): Promise<LogoutRequest> {
    return this.get<LogoutRequest>('logout-request', {
      mustExist: true,
      deleteAfter: true,
    }) as Promise<LogoutRequest>
  }

  async setVerifier(challenge: string, verifier: string): Promise<void> {
    await this.set(`verifier:${challenge}`, verifier, 300_000 /* 5 minutes */)
  }
  getVerifier(challenge: string): Promise<string> {
    return this.get(`verifier:${challenge}`, {
      mustExist: true,
      deleteAfter: true,
    }) as Promise<string>
  }

  async setOpenIdConfiguration(
    username: string,
    openidConfiguration: any,
    timeout: number,
  ): Promise<void> {
    await this.set(
      `openidConfiguration:${username}`,
      openidConfiguration,
      timeout,
    )
  }
  getOpenIdConfiguration(username: string): Promise<any> {
    return this.get(`openidConfiguration:${username}`)
  }

  async setAuthorization(authorization: Authorization): Promise<void> {
    const authorizationOptions: AuthorizationOptions = {
      clientID: authorization.idToken.aud,
      resource: authorization.resource,
      scope: authorization.scope,
      username: authorization.idToken.sub,
    }

    const expiresIn = authorization.expiresAt - Date.now()

    if (this.client.cacheOptions.setDefaultUsername) {
      await this.client.cacheOptions.setDefaultUsername(
        authorization.idToken.sub,
      )
    }

    await this.set('username', authorizationOptions.username, expiresIn)
    await this.set(
      await this._getAuthorizationKey(authorizationOptions),
      authorization,
      expiresIn,
    )
  }
  async deleteAuthorization(options: AuthorizationOptions): Promise<boolean> {
    const fallbackUsername = await this.get<string>('username')

    options.username = await this._getUsername(
      options.username,
      fallbackUsername,
    )

    if (options.username === fallbackUsername) {
      await this.client.store.delete('username')
    }

    return this.client.store.delete(await this._getAuthorizationKey(options))
  }
  async getAuthorization(
    options: AuthorizationOptions,
  ): Promise<Authorization> {
    return this.get(await this._getAuthorizationKey(options), {
      mustExist: true,
    }) as Promise<Authorization>
  }

  private async _getAuthorizationKey(
    options: AuthorizationOptions,
  ): Promise<string> {
    return `authorization?${util.objectToKey({
      username: await this._getUsername(
        options.username,
        await this.get('username'),
      ),
      clientID: options.clientID ?? this.client.fallbackLoginOptions.clientID,
      scope: util.getSortedScope(
        options.scope ?? this.client.fallbackLoginOptions.scope,
      ),
      resource: options.resource ?? this.client.fallbackLoginOptions.resource,
    })}`
  }

  private async _getUsername(username?: string, fallbackUsername?: string) {
    if (username == null && fallbackUsername == null) {
      throw new Error('no username given')
    }

    return username ?? fallbackUsername
  }
}

export default ClientStore
