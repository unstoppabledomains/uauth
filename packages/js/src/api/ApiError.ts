import {ErrorResponse} from './types'

export default class ApiError extends Error {
  constructor(
    public code: string,
    public description: string,
    public uri?: string,
  ) {
    super(`${code}: ${description}${uri ? `\nSee more at ${uri}.` : ''}`)
  }

  static fromResponse(response: ErrorResponse) {
    return new ApiError(
      response.error,
      response.error_description,
      response.error_uri,
    )
  }
}
