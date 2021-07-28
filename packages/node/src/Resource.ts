import {RequestHandler} from 'express'

interface AccessToken {
  a: 'a'
}

declare global {
  // eslint-disable-next-line
  namespace Express {
    interface Request {
      accessToken?: AccessToken
    }
  }
}

export default class Resource {
  constructor() {
    //
  }

  async validateAuthorization(
    header?: string,
    scopes: string[],
  ): Promise<AccessToken> {
    if (!header) {
      throw new Error('no Authorization header')
    }

    if (!header.startsWith('Bearer ')) {
      throw new Error('bad Authentication scheme, must be Bearer')
    }

    const bearerToken = header.substring(7)

    return JSON.parse(btoa(bearerToken))
  }

  createExpressMiddleware(scopes: string[]): RequestHandler {
    return (req, res, next) => {
      this.validateAuthorization(req.headers.authorization, scopes)
        .then(accessToken => {
          req.accessToken = accessToken

          next()
        })
        .catch(next)
    }
  }
}
