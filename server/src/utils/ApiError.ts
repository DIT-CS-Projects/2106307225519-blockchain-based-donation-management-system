/** Operational error with an HTTP status code, thrown by services/controllers. */
export class ApiError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ApiError'
  }

  static badRequest(message = 'Bad request') {
    return new ApiError(400, message)
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message)
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message)
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message)
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message)
  }

  static badGateway(message = 'Upstream service error') {
    return new ApiError(502, message)
  }
}
