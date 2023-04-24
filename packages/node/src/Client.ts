import {
  DomainResolver,
  IssuerResolver,
  DefaultIPFSResolver,
  DefaultIssuerResolver,
  DefaultWebFingerResolver,
  AuthorizationCodeTokenEndpointRequest,
  AuthorizationEndpointRequest,
  TokenEndpointResponse,
  Authorization,
  AuthorizationEndpointResponse,
} from '@uauth/common'
import type {Request, Response, NextFunction} from 'express'
import {generateCodeChallengeAndVerifier, getRandomBytes} from './util'
import verifyIdToken from './verifyIdToken'
import {VERSION} from './version'

interface Interaction {
  state: string
  nonce: string
  verifier: string
  tokenEndpoint: string
  jwksUri?: string
  jwks?: string
}

declare module 'express-session' {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface SessionData {
    [key: string]: any
  }
}

declare module 'express' {
  export interface Response {
    locals: Record<string, any>
  }
}

interface ClientOptions {
  clientID: string
  clientSecret: string
  scope: string
  redirectUri: string
  maxAge: number
  clockSkew: number
  audience?: string
  resolution: DomainResolver
  fallbackIssuer: string
  createIpfsUrl: (cid: string, path: string) => string
}

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type ClientConstructorOptions = Optional<
  ClientOptions,
  'fallbackIssuer' | 'scope' | 'maxAge' | 'clockSkew' | 'createIpfsUrl'
>

interface BuildAuthorizationUrlAndInteractionOptions {
  username?: string
}

interface LoginOptions extends BuildAuthorizationUrlAndInteractionOptions {
  beforeRedirect?(options: LoginOptions, url: string): Promise<void> | void
}

interface ExpressSessionContext {
  req: Request
  res: Response
  next: NextFunction
}
interface ExpressSessionLogin {
  login: (
    req: Request,
    res: Response,
    next: NextFunction,
    options: LoginOptions,
  ) => Promise<void>
  callback: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<Authorization>
  middleware: (
    scopes?: string[],
  ) => (req: Request, res: Response, next: NextFunction) => void
}

class Client {
  public options: ClientOptions
  public issuerResolver: IssuerResolver

  constructor(options: ClientConstructorOptions) {
    options.fallbackIssuer =
      options.fallbackIssuer || 'https://auth.unstoppabledomains.com'
    options.scope = options.scope || 'openid'
    options.maxAge = options.maxAge || 600
    options.clockSkew = options.clockSkew || 60

    this.options = options as ClientOptions

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    this.issuerResolver = new DefaultIssuerResolver({
      webfingerResolver: new DefaultWebFingerResolver({
        ipfsResolver: new DefaultIPFSResolver((...args) =>
          (this.options.createIpfsUrl || DefaultIPFSResolver.defaultCreateUrl)(
            ...args,
          ),
        ),
        domainResolver: {
          records(
            domain: string,
            keys: string[],
          ): Promise<Record<string, string>> {
            return self.options.resolution.records(domain, keys)
          },
        },
      }),
    })
  }

  createExpressSessionLogin(
    sessionKey = 'uauth',
    localsKey = 'uauth',
  ): ExpressSessionLogin {
    const {login, callback, middleware} =
      this.createLogin<ExpressSessionContext>({
        storeInteraction: (ctx, interaction) => {
          ctx.req.session[sessionKey] = {interaction}
        },
        retrieveInteraction: ctx => ctx.req.session[sessionKey]?.interaction,
        deleteInteraction: ctx => {
          delete ctx.req.session[sessionKey].interaction
        },
        storeAuthorization: (ctx, authorization) => {
          ctx.req.session[sessionKey] = {uauth: authorization}
        },
        retrieveAuthorization: ctx => ctx.req.session[sessionKey].uauth,
        deleteAuthorization: ctx => {
          delete ctx.req.session[sessionKey].uauth
        },
        retrieveAuthorizationEndpointResponse: ctx => ctx.req.body,
        passOnAuthorization: (ctx, authorization) => {
          ctx.res.locals[localsKey] = authorization
          return ctx.next()
        },
        redirect: (ctx, url) => {
          ctx.res.redirect(url)
        },
      })

    return {
      login: (req, res, next, options) => login({req, res, next}, options),
      callback: (req: Request, res: Response, next: NextFunction) =>
        callback({req, res, next}),
      middleware:
        (scopes: string[] = []) =>
        (req: Request, res: Response, next: NextFunction) =>
          middleware({req, res, next}, scopes),
    }
  }

  formatUrlSearchParams(
    endpoint: string,
    params: Record<string, string>,
  ): string {
    const url = new URL(endpoint)

    url.search = new URLSearchParams(
      Object.entries(params).reduce((a, [k, v]) => {
        if (k && v) {
          a.push([k, v])
        }
        return a
      }, [] as Array<[string, string]>),
    ).toString()

    return url.toString()
  }

  async buildAuthorizationUrlAndInteraction(
    options: BuildAuthorizationUrlAndInteractionOptions,
  ): Promise<{url: string; interaction: Interaction}> {
    const openidConfiguration = options.username
      ? await this.issuerResolver.resolve(
          options.username,
          this.options.fallbackIssuer,
        )
      : await fetch(
          this.options.fallbackIssuer + '/.well-known/openid-configuration',
        ).then(resp =>
          resp.ok
            ? resp.json()
            : Promise.reject(new Error('bad openid-configuration response')),
        )

    if (!openidConfiguration.authorization_endpoint) {
      throw new Error('no authorization_endpoint')
    }

    const nonce = getRandomBytes(32).toString('base64')
    const state = getRandomBytes(32).toString('base64')

    const codeChallengeMethod = 'S256'
    const {verifier, challenge} = await generateCodeChallengeAndVerifier(
      43,
      codeChallengeMethod,
    )

    const request: AuthorizationEndpointRequest = {
      client_id: this.options.clientID,
      login_hint: options.username,
      code_challenge: challenge,
      code_challenge_method: codeChallengeMethod,
      nonce,
      state,
      max_age: this.options.maxAge,
      resource: this.options.audience,
      redirect_uri: this.options.redirectUri,
      response_type: 'code',
      response_mode: 'form_post',
      scope: this.options.scope,
      prompt: 'login',
      package_name: '@uauth/node',
      package_version: VERSION,
    }

    const interaction: Interaction = {
      nonce,
      state,
      verifier,
      tokenEndpoint: openidConfiguration.token_endpoint!,
      jwksUri: openidConfiguration.jwks_uri,
      jwks: openidConfiguration.jwks as any,
    }

    return {
      url: this.formatUrlSearchParams(
        openidConfiguration.authorization_endpoint,
        request,
      ),
      interaction,
    }
  }

  async authorizationCodeGrantExchange(
    interaction: Interaction,
    authorizationEndpointResponse: AuthorizationEndpointResponse,
  ): Promise<Authorization> {
    if (authorizationEndpointResponse.state !== interaction.state) {
      throw new Error('invalid state')
    }

    const tokenRequest: AuthorizationCodeTokenEndpointRequest = {
      client_id: this.options.clientID,
      client_secret: this.options.clientSecret,
      code: authorizationEndpointResponse.code,
      code_verifier: interaction.verifier,
      grant_type: 'authorization_code',
      redirect_uri: this.options.redirectUri,
    }

    const tokenResponse: TokenEndpointResponse = await fetch(
      interaction.tokenEndpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenRequest).toString(),
      },
    ).then(async resp =>
      resp.ok ? resp.json() : Promise.reject(await resp.json()),
    )

    const idToken = await verifyIdToken(
      interaction.jwksUri,
      interaction.jwks,
      tokenResponse.id_token!,
      interaction.nonce,
    )

    // Verifiy token
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000
    const authorization: Authorization = {
      accessToken: tokenResponse.access_token,
      idToken,
      expiresAt,
      scope: tokenResponse.scope,
      audience: this.options.audience,
    }

    return authorization
  }

  validateAuthorization(
    authorization: Authorization | undefined,
    scopes: string[] = [],
  ) {
    if (!authorization) {
      throw new Error('no authorization present')
    }

    if (
      authorization.audience &&
      this.options.audience !== authorization.audience
    ) {
      throw new Error('incorrect audience for token')
    }

    if (
      scopes.length > 0 &&
      !authorization.scope.split(/\s+/).some(v => scopes.includes(v))
    ) {
      throw new Error('scope not allowed')
    }

    if (authorization.expiresAt < Date.now()) {
      throw new Error('authorization has expired')
    }
  }

  createLogin<T>(actions: {
    storeInteraction: (ctx: T, interaction: Interaction) => void | Promise<void>
    retrieveInteraction: (
      ctx: T,
    ) => Interaction | undefined | Promise<Interaction | undefined>
    deleteInteraction: (ctx: T) => void | Promise<void>
    storeAuthorization: (
      ctx: T,
      authorization: Authorization,
    ) => void | Promise<void>
    retrieveAuthorization: (
      ctx: T,
    ) => Authorization | undefined | Promise<Authorization | undefined>
    deleteAuthorization: (ctx: T) => void | Promise<void>
    retrieveAuthorizationEndpointResponse: (
      ctx: T,
    ) => AuthorizationEndpointResponse
    passOnAuthorization: (ctx: T, authorization: Authorization) => void
    redirect: (ctx: T, url: string) => void | Promise<void>
  }): {
    login(ctx: T, options: LoginOptions): Promise<void>
    callback(ctx: T): Promise<Authorization>
    middleware(ctx: T, scopes?: string[]): void
  } {
    return {
      login: async (ctx, options) => {
        const {url, interaction} =
          await this.buildAuthorizationUrlAndInteraction(options)

        await actions.storeInteraction(ctx, interaction)

        if (typeof options.beforeRedirect === 'function') {
          await options.beforeRedirect(options, url)
        }

        return actions.redirect(ctx, url)
      },
      callback: async ctx => {
        const interaction = await actions.retrieveInteraction(ctx)

        if (!interaction) {
          throw new Error('no interaction')
        }

        await actions.deleteInteraction(ctx)

        const response = await actions.retrieveAuthorizationEndpointResponse(
          ctx,
        )

        if ((response as any).error) {
          throw new Error(
            `${(response as any).error}: ${
              (response as any).error_description
            }`,
          )
        }

        const authorization = await this.authorizationCodeGrantExchange(
          interaction,
          response,
        )

        await actions.storeAuthorization(ctx, authorization)

        return authorization
      },
      middleware: async (ctx, scopes?: string[]) => {
        const authorization = await actions.retrieveAuthorization(ctx)

        try {
          this.validateAuthorization(authorization, scopes)
        } catch (error) {
          await actions.deleteAuthorization(ctx)

          throw error
        }

        return actions.passOnAuthorization(ctx, authorization!)
      },
    }
  }
}

export default Client
