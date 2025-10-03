export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  //400 Bad Request errors
  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }
  //401 Unauthorized errors
  static unauthorized(message = "Authentication required"): ApiError {
    return new ApiError(401, message);
  }

  //403 Forbidden errors
  static forbidden(message = "Access denied"): ApiError {
    return new ApiError(403, message);
  }

  //404 Not Found errors
  static notFound(message = "Resource not found"): ApiError {
    return new ApiError(404, message);
  }

  //409 Conflit errors
  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  //413 Too large file errors
  static PayloadTooLarge(message: string): ApiError {
    return new ApiError(413, message);
  }

  //422 Unprocessable errors
  static validationError(message = "Validation failed"): ApiError {
    return new ApiError(422, message);
  }

  //429 too many requests errors
  static tooManyRequests(
    message = "Too Many Requests. Wait a moment and try again"
  ): ApiError {
    return new ApiError(429, message);
  }

  //500 Internal Server errors
  static internalServer(message = "Internal Server"): ApiError {
    return new ApiError(500, message, false);
  }
}
