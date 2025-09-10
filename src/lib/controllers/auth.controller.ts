import { NextRequest, NextResponse } from "next/server";
import { LoginCredentials, RegisterCredentials } from "../types/auth";
import { AuthService } from "../services/auth.service";
import { ValidationMiddleware } from "../middleware/validation.middleware";
import { ApiError } from "../utils/apiError";
import { ErrorMiddleware } from "../middleware/error.middleware";
import { RateLimitMiddleware } from "../middleware/rateLimit.middleware";

export class AuthController {
  private static instance: AuthController;
  private authService: AuthService;

  private constructor() {
    this.authService = AuthService.getInstance();
  }

  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  register = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId = request.headers.get("x-request-id")!;

      // Apply rate limiting (5 attempts per 15 minutes)
      const rateLimiter = RateLimitMiddleware.limit({
        maxRequests: 5,
        windowMs: 15 * 60 * 1000,
      });
      rateLimiter(request);

      //Parse and validate request
      const body = await request.json();
      const validation = ValidationMiddleware.registerValidation(body);

      if (!validation.isValid) {
        ApiError.validationError(
          `Registration validation failed: ${validation.errors.join(", ")}`
        );
      }

      const credentials: RegisterCredentials = {
        username: body.username,
        email: body.email,
        password: body.password,
      };

      const user = await this.authService.register(credentials);

      return NextResponse.json(
        {
          success: true,
          requestId,
          message: "User registered successfully",
          data: {
            id: user._id,
            username: user.username,
            email: user.email,
            provider: user.provider,
          },
        },
        { status: 201 }
      );
    }
  );

  login = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId = request.headers.get("x-request-id")!;

      const rateLimiter = RateLimitMiddleware.limit({
        maxRequests: 10,
        windowMs: 15 * 60 * 1000,
      });
      rateLimiter(request);

      const body = await request.json();
      const validation = ValidationMiddleware.loginValidation(body);

      if (!validation.isValid) {
        throw ApiError.validationError(
          `Login validation failed: ${validation.errors.join(", ")}`
        );
      }

      const credentials: LoginCredentials = {
        email: body.email,
        password: body.password,
      };

      // Get user agent and device info
      const userAgent = request.headers.get("user-agent") || "";
      const device = this.extractDeviceInfo(userAgent);

      const { user, tokens } = await this.authService.login(
        credentials,
        userAgent,
        device
      );

      // Set refresh token as httpOnly cookie
      const response = NextResponse.json(
        {
          success: true,
          requestId,
          message: "Login successful",
          data: {
            user: {
              id: user._id,
              username: user.username,
              email: user.email,
              provider: user.provider,
            },
            accessToken: tokens.accessToken,
            expiresAt: tokens.accessTokenExpires,
          },
        },
        { status: 200 }
      );

      // Set refresh token as secure httpOnly cookie
      response.cookies.set("refresh-token", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      return response;
    }
  );

  refreshToken = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId = request.headers.get("x-request-id")!;

      const refreshToken = request.cookies.get("refresh-token")?.value;

      if (!refreshToken) {
        throw ApiError.unauthorized("Missing refresh token");
      }

      const tokens = await this.authService.refreshTokens(refreshToken);

      if (!tokens) {
        throw ApiError.unauthorized("Invalid refresh token");
      }

      const response = NextResponse.json(
        {
          success: true,
          requestId,
          message: "Token refreshed successfully",
          data: {
            accessToken: tokens.accessToken,
            expiresAt: tokens.accessTokenExpires,
          },
        },
        { status: 200 }
      );

      // Update refresh token cookie
      response.cookies.set("refresh-token", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      return response;
    }
  );

  logout = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId = request.headers.get("x-request-id")!;
      const refreshToken = request.cookies.get("refresh-token")?.value;
      const userId = request.headers.get("x-user-id");

      if (!userId) {
        throw ApiError.unauthorized("User ID required");
      }

      await this.authService.logout(userId, refreshToken);

      const response = NextResponse.json(
        {
          success: true,
          requestId,
          message: "Logged out successfully",
        },
        { status: 200 }
      );

      // Clear refresh token cookie
      response.cookies.set("refresh-token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      });

      return response;
    }
  );

  private extractDeviceInfo(userAgent: string): string {
    if (userAgent.includes("Mobile")) return "Mobile Device";
    if (userAgent.includes("Tablet")) return "Tablet";
    if (userAgent.includes("Windows")) return "Windows PC";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Linux")) return "Linux PC";
    return "Unknown Device";
  }
}
