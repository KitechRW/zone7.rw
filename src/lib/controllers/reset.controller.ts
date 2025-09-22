import { NextRequest, NextResponse } from "next/server";
import { ErrorMiddleware } from "../middleware/error.middleware";
import { RateLimitMiddleware } from "../middleware/rateLimit.middleware";
import { getValidatedData } from "../middleware/validation.middleware";
import { ApiError } from "../utils/apiError";
import {
  ForgotPasswordData,
  PasswordResetService,
  ResetPasswordData,
} from "../services/reset.service";

export class PasswordResetController {
  private static instance: PasswordResetController;
  private passwordResetService: PasswordResetService;

  private constructor() {
    this.passwordResetService = PasswordResetService.getInstance();
  }

  public static getInstance(): PasswordResetController {
    if (!PasswordResetController.instance) {
      PasswordResetController.instance = new PasswordResetController();
    }
    return PasswordResetController.instance;
  }

  forgotPassword = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Apply rate limiting (3 attempts per 10 minutes per IP)
      const rateLimiter = RateLimitMiddleware.limit({
        maxRequests: 3,
        windowMs: 10 * 60 * 1000,
      });
      rateLimiter(request);

      const data = getValidatedData<ForgotPasswordData>(request);

      await this.passwordResetService.initiatePasswordReset(data);

      // Always return success to prevent email enumeration
      return NextResponse.json(
        {
          success: true,
          requestId,
          message:
            "If an account with that email exists, you will receive a password reset link.",
        },
        { status: 200 }
      );
    }
  );

  resetPassword = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Apply rate limiting (5 attempts per 15 minutes per IP)
      const rateLimiter = RateLimitMiddleware.limit({
        maxRequests: 5,
        windowMs: 15 * 60 * 1000,
      });
      rateLimiter(request);

      const data = getValidatedData<ResetPasswordData>(request);

      await this.passwordResetService.resetPassword(data);

      return NextResponse.json(
        {
          success: true,
          requestId,
          message:
            "Password reset successful. Please login with your new password.",
        },
        { status: 200 }
      );
    }
  );

  validateToken = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const url = new URL(request.url);
      const token = url.searchParams.get("token");

      if (!token) {
        throw ApiError.badRequest("Reset token is required");
      }

      const validation = await this.passwordResetService.validateResetToken(
        token
      );

      return NextResponse.json(
        {
          success: true,
          requestId,
          data: validation,
        },
        { status: 200 }
      );
    }
  );
}
