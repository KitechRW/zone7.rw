import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isadmin, isBrokerOrAdmin, UserRole } from "../utils/permission";
import { authConfig } from "../config/auth.config";

export class AuthMiddleware {
  static async requireAuth(request: NextRequest): Promise<NextResponse | null> {
    const session = await getServerSession(authConfig);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Add user data to headers for downstream handlers
    request.headers.set("x-user-id", session.user.id);
    request.headers.set("x-user-role", session.user.role);
    request.headers.set("x-user-username", session.user.username);

    return null; // No error response means auth passed
  }

  static async requireBroker(
    request: NextRequest
  ): Promise<NextResponse | null> {
    const session = await getServerSession(authConfig);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    if (!isBrokerOrAdmin(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Broker access required",
        },
        { status: 403 }
      );
    }

    request.headers.set("x-user-id", session.user.id);
    request.headers.set("x-user-role", session.user.role);

    return null;
  }

  static async requireAdmin(
    request: NextRequest
  ): Promise<NextResponse | null> {
    const session = await getServerSession(authConfig);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    if (!isadmin(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    request.headers.set("x-user-id", session.user.id);
    request.headers.set("x-user-role", session.user.role);

    return null;
  }

  static async optionalAuth(request: NextRequest): Promise<{
    userId: string | null;
    role: UserRole | null;
  }> {
    const session = await getServerSession(authConfig);

    if (session?.user) {
      request.headers.set("x-user-id", session.user.id);
      request.headers.set("x-user-role", session.user.role);
      return {
        userId: session.user.id,
        role: session.user.role,
      };
    }

    return { userId: null, role: null };
  }
}
