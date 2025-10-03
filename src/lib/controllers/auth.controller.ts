import { NextRequest, NextResponse } from "next/server";
import { LoginCredentials, RegisterCredentials } from "../types/auth";
import { AuthService } from "../services/auth.service";
import { ApiError } from "../utils/apiError";
import { ErrorMiddleware } from "../middleware/error.middleware";
import { RateLimitMiddleware } from "../middleware/rateLimit.middleware";
import { getValidatedData } from "../middleware/validation.middleware";
import { UserRole, isOwner, isAdminOrOwner } from "../utils/permission";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { IUser } from "../db/models/user.model";

interface RouteContext {
  params: { id: string };
}

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
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Apply rate limiting (5 attempts per 15 minutes)
      const rateLimiter = RateLimitMiddleware.limit({
        maxRequests: 5,
        windowMs: 15 * 60 * 1000,
      });
      rateLimiter(request);

      const credentials = getValidatedData<RegisterCredentials>(request);

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
            role: user.role,
          },
        },
        { status: 201 }
      );
    }
  );

  login = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const rateLimiter = RateLimitMiddleware.limit({
        maxRequests: 10,
        windowMs: 15 * 60 * 1000,
      });
      rateLimiter(request);

      const credentials = getValidatedData<LoginCredentials>(request);

      const userAgent = request.headers.get("user-agent") || "";
      const device = this.extractDeviceInfo(userAgent);

      const { user, tokens } = await this.authService.login(
        credentials,
        userAgent,
        device
      );

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
              role: user.role,
            },
            accessToken: tokens.accessToken,
            expiresAt: tokens.accessTokenExpires,
          },
        },
        { status: 200 }
      );

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

  createAdmin = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const credentials = getValidatedData<{ username: string; email: string }>(
        request
      );

      const user = await this.authService.createAdmin(credentials);

      return NextResponse.json(
        {
          success: true,
          requestId,
          message: "Admin user created successfully",
          data: {
            id: user._id,
            username: user.username,
            email: user.email,
            provider: user.provider,
            role: user.role,
            createdAt: user.createdAt,
          },
        },
        { status: 201 }
      );
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

  getAuthStatus = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const { userId } = await AuthMiddleware.optionalAuth(request);

      if (!userId) {
        return NextResponse.json(
          {
            success: true,
            authenticated: false,
            user: null,
          },
          { status: 200 }
        );
      }

      const user = await this.authService.getUserById(userId);

      if (!user) {
        return NextResponse.json(
          {
            success: true,
            authenticated: false,
            user: null,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          authenticated: true,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            provider: user.provider,
          },
        },
        { status: 200 }
      );
    }
  );

  getAllUsers = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const authError = await AuthMiddleware.requireAdmin(request);
      if (authError) return authError;

      const { searchParams } = new URL(request.url);

      const filters = {
        role: (searchParams.get("role") as UserRole | "all") || "all",
        search: searchParams.get("search") || undefined,
        provider:
          (searchParams.get("provider") as "credentials" | "all") || "all",
        startDate: searchParams.get("startDate")
          ? new Date(searchParams.get("startDate")!)
          : undefined,
        endDate: searchParams.get("endDate")
          ? new Date(searchParams.get("endDate")!)
          : undefined,
      };

      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const sortBy = searchParams.get("sortBy") || "createdAt";
      const sortOrder =
        (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

      const result = await this.authService.getAllUsers(
        filters,
        page,
        limit,
        sortBy,
        sortOrder
      );

      return NextResponse.json(
        {
          success: true,
          message: "Users fetched successfully",
          data: result.users,
          pagination: {
            page,
            limit,
            total: result.total,
            pages: result.pages,
          },
        },
        { status: 200 }
      );
    }
  );

  getUserProfile = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const authError = await AuthMiddleware.requireAuth(request);
      if (authError) return authError;

      const userId = request.headers.get("x-user-id");
      const user = await this.authService.getUserById(userId!);

      if (!user) {
        throw ApiError.notFound("User not found");
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            provider: user.provider,
            emailVerified: user.emailVerified,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
        { status: 200 }
      );
    }
  );

  getUserStats = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const authError = await AuthMiddleware.requireAdmin(request);
      if (authError) return authError;

      const stats = await this.authService.getUserStats();

      return NextResponse.json(
        {
          success: true,
          message: "User statistics fetched successfully",
          data: stats,
        },
        { status: 200 }
      );
    }
  );

  updateUserRole = ErrorMiddleware.catchAsync(
    async (
      request: NextRequest,
      context: RouteContext
    ): Promise<NextResponse> => {
      const authError = await AuthMiddleware.requireAdmin(request);
      if (authError) return authError;

      const requesterId = request.headers.get("x-user-id")!;
      const requesterRole = request.headers.get("x-user-role") as UserRole;
      const { role } = await request.json();

      if (!role || !Object.values(UserRole).includes(role)) {
        throw ApiError.badRequest("Invalid role");
      }

      const targetUser = await this.authService.getUserById(context.params.id);
      if (!targetUser) {
        throw ApiError.notFound("User not found");
      }

      if (role === UserRole.ADMIN || role === UserRole.OWNER) {
        if (!isOwner(requesterRole)) {
          throw ApiError.forbidden(
            "Only owners can promote users to admin or owner roles"
          );
        }
      }

      if (
        targetUser.role === UserRole.ADMIN ||
        targetUser.role === UserRole.OWNER
      ) {
        if (!isOwner(requesterRole)) {
          throw ApiError.forbidden(
            "Only owners can modify admin or owner roles"
          );
        }
      }

      if (role === UserRole.OWNER) {
        throw ApiError.badRequest(
          "Owner role assignment requires special authorization"
        );
      }

      const user = await this.authService.updateUserRole(
        context.params.id,
        role,
        requesterId
      );

      return NextResponse.json(
        {
          success: true,
          message: "User role updated successfully",
          data: user,
        },
        { status: 200 }
      );
    }
  );

  deleteUser = ErrorMiddleware.catchAsync(
    async (
      request: NextRequest,
      context: RouteContext
    ): Promise<NextResponse> => {
      const authError = await AuthMiddleware.requireAdmin(request);
      if (authError) return authError;

      const requesterId = request.headers.get("x-user-id")!;

      await this.authService.deleteUser(context.params.id, requesterId);

      return NextResponse.json(
        {
          success: true,
          message: "User deleted successfully",
        },
        { status: 200 }
      );
    }
  );

  getUserById = ErrorMiddleware.catchAsync(
    async (
      request: NextRequest,
      context: RouteContext
    ): Promise<NextResponse> => {
      const authError = await AuthMiddleware.requireAuth(request);
      if (authError) return authError;

      const userRole = request.headers.get("x-user-role") as UserRole;
      const userId = request.headers.get("x-user-id");

      if (!isAdminOrOwner(userRole) && context.params.id !== userId) {
        throw ApiError.forbidden("Access denied");
      }

      const user = await this.authService.getUserById(context.params.id);

      if (!user) {
        throw ApiError.notFound("User not found");
      }

      return NextResponse.json(
        {
          success: true,
          message: "User fetched successfully",
          data: user,
        },
        { status: 200 }
      );
    }
  );

  getProfile = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const authError = await AuthMiddleware.requireAuth(request);
      if (authError) return authError;

      const userId = request.headers.get("x-user-id")!;
      const user = await this.authService.getUserById(userId);

      return NextResponse.json(
        {
          success: true,
          data: this.formatUserResponse(user as IUser),
        },
        { status: 200 }
      );
    }
  );

  updateProfile = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const authError = await AuthMiddleware.requireAuth(request);
      if (authError) return authError;

      const userId = request.headers.get("x-user-id")!;
      const updates = await request.json();

      //Prevent role changes through profile update
      if (updates.role) {
        delete updates.role;
      }

      const user = await this.authService.updateUserProfile(userId, updates);

      return NextResponse.json(
        {
          success: true,
          message: "Profile updated successfully",
          data: this.formatUserResponse(user),
        },
        { status: 200 }
      );
    }
  );

  getSessions = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const authError = await AuthMiddleware.requireAuth(request);
      if (authError) return authError;

      const userId = request.headers.get("x-user-id")!;
      const sessions = await this.authService.getUserSessions(userId);

      return NextResponse.json(
        {
          success: true,
          data: { sessions },
        },
        { status: 200 }
      );
    }
  );

  private formatUserResponse(user: IUser) {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      provider: user.provider,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private extractDeviceInfo(userAgent: string): string {
    if (userAgent.includes("Mobile")) return "Mobile Device";
    if (userAgent.includes("Tablet")) return "Tablet";
    if (userAgent.includes("Windows")) return "Windows PC";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Linux")) return "Linux PC";
    return "Unknown Device";
  }
}
