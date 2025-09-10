import DBConnection from "@/lib/db/connect";
import { User } from "@/lib/db/models/user.model";
import { AuthMiddleware } from "@/lib/middleware/auth.middleware";
import { RefreshTokenData } from "@/lib/types/auth";
import logger from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const authError = await AuthMiddleware.requireAuth(request);
    if (authError) return authError;

    const userId = request.headers.get("x-user-id");

    await DBConnection.getInstance().connect();

    const user = await User.findById(userId).select("refreshTokens");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const sessions = user.refreshTokens
      .filter((token: RefreshTokenData) => token.expiresAt > new Date())
      .map((token: RefreshTokenData) => ({
        device: token.device,
        userAgent: token.userAgent,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
      }));

    return NextResponse.json(
      {
        success: true,
        data: { sessions },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Sessions fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          (error instanceof Error && error.message) ||
          "Failed to fetch sessions",
      },
      { status: 500 }
    );
  }
};
