import { NextRequest, NextResponse } from "next/server";
import { Tokens } from "../utils/tokens";

export class AuthMiddleware {
  static async verifyToken(request: NextRequest): Promise<{
    isValid: boolean;
    userId?: string;
    error?: string;
  }> {
    try {
      const authHeader = request.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { isValid: false, error: "No valid authorization header" };
      }

      const token = authHeader.substring(7);
      const payload = (await Tokens.verifyAccessToken(token)) as {
        userId: string;
      };

      return {
        isValid: true,
        userId: payload.userId,
      };
    } catch (error) {
      return {
        isValid: false,
        error:
          (error instanceof Error && error.message) ||
          "Token verification failed",
      };
    }
  }

  static async requireAuth(request: NextRequest): Promise<NextResponse | null> {
    const verification = await this.verifyToken(request);

    if (!verification.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: verification.error || "Authentication required",
        },
        { status: 401 }
      );
    }

    // Add user ID to headers for downstream handlers
    request.headers.set("x-user-id", verification.userId!);

    return null; // No error response means auth passed
  }

  static async optionalAuth(request: NextRequest): Promise<string | null> {
    const verification = await this.verifyToken(request);

    if (verification.isValid) {
      request.headers.set("x-user-id", verification.userId!);
      return verification.userId!;
    }

    return null;
  }
}
