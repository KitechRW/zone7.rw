import { NextRequest, NextResponse } from "next/server";
import logger from "../utils/logger";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError";

interface ErrorResponse {
  success: false;
  message: string;
  requestId: string;
  timestamp: string;
  path: string;
  stack?: string;
  details?: unknown;
}

interface RequestMetadata {
  requestId: string;
  method: string;
  path: string;
  url: string;
  userAgent: string;
  ip: string;
  userId?: string;
  timestamp: string;
}

interface MongoError {
  code: number;
  keyValue?: Record<string, unknown>;
}

export class ErrorMiddleware {
  static catchAsync(
    handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>
  ) {
    return async (
      request: NextRequest,
      ...args: unknown[]
    ): Promise<NextResponse> => {
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      try {
        // Add request ID to headers for tracing
        request.headers.set("x-request-id", requestId);

        return await handler(request, ...args);
      } catch (error) {
        return this.handleError(error, request, requestId);
      }
    };
  }

  //Central error handler
  private static handleError(
    error: unknown,
    request: NextRequest,
    requestId: string
  ): NextResponse {
    //Convert any error to ApiError
    const apiError = this.convertToApiError(error);

    //Extract request metadata
    const metadata = this.extractRequestMetadata(request, requestId);

    //Log the error
    this.logError(apiError, metadata);

    //Build and return error response
    return this.buildErrorResponse(apiError, metadata);
  }

  private static convertToApiError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof ZodError) {
      const messages = error.issues.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      return ApiError.validationError(
        `Validation failed: ${messages.join(", ")}`
      );
    }

    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((err) => err.message);
      return ApiError.validationError(
        `Database validation failed: ${messages.join(", ")}`
      );
    }

    // Mongoose duplicate key error (11000)
    if (this.isMongoError(error)) {
      const mongoError = error as MongoError;

      if (mongoError.code === 11000) {
        const field = Object.keys(mongoError.keyValue || {})[0] || "field";
        const value = mongoError.keyValue?.[field] ?? "value";
        return ApiError.conflict(`${field} '${value}' already exists`);
      }
    }

    if (error instanceof mongoose.Error.CastError) {
      return ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
    }

    if (this.isJWTError(error)) {
      if ((error as { name?: string }).name === "TokenExpiredError") {
        return ApiError.unauthorized("Token has expired");
      }
      return ApiError.unauthorized("Invalid token");
    }

    if (this.isNetworkError(error)) {
      return ApiError.internalServer("Service temporarily unavailable");
    }

    // Default fallback for unknown errors
    if (error instanceof Error) {
      const isDevelopment = process.env.NODE_ENV === "development";
      const message = isDevelopment ? error.message : "Something went wrong";
      return ApiError.internalServer(message);
    }

    // Non-Error objects
    return ApiError.internalServer("An unexpected error occurred");
  }

  //Extract request metadata for logging and response
  private static extractRequestMetadata(
    request: NextRequest,
    requestId: string
  ) {
    return {
      requestId,
      method: request.method,
      path: request.nextUrl.pathname,
      url: request.nextUrl.href,
      userAgent: request.headers.get("user-agent") || "unknown",
      ip: this.getClientIP(request),
      userId: request.headers.get("x-user-id") || undefined,
      timestamp: new Date().toISOString(),
    };
  }

  private static logError(apiError: ApiError, metadata: RequestMetadata) {
    const logData = {
      message: apiError.message,
      statusCode: apiError.statusCode,
      isOperational: apiError.isOperational,
      stack: apiError.stack,
      ...metadata,
    };

    if (apiError.statusCode >= 500) {
      logger.error("Server Error", logData);
    } else if (apiError.statusCode >= 400) {
      logger.warn("Client Error", logData);
    } else {
      logger.info("Request Error", logData);
    }
  }

  private static buildErrorResponse(
    apiError: ApiError,
    metadata: RequestMetadata
  ): NextResponse {
    const errorResponse: ErrorResponse = {
      success: false,
      message: apiError.message,
      requestId: metadata.requestId,
      timestamp: metadata.timestamp,
      path: metadata.path,
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === "development" && apiError.stack) {
      errorResponse.stack = apiError.stack;
    }

    return NextResponse.json(errorResponse, {
      status: apiError.statusCode,
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": metadata.requestId,
      },
    });
  }

  //Helper methods for error type detection
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    return forwarded?.split(",")[0] || realIp || "unknown";
  }

  private static isMongoError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      typeof (error as { name?: string; code?: number }).name === "string" &&
      ((error as { name?: string; code?: number }).name?.includes("Mongo") ||
        (error as { code?: number }).code === 11000)
    );
  }

  private static isJWTError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(
        (error as { name?: string }).name ?? ""
      )
    );
  }

  private static isNetworkError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND"].includes(
        (error as { code?: string }).code ?? ""
      )
    );
  }
}
