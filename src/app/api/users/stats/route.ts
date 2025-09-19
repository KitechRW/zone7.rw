import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/utils/apiError";
import logger from "@/lib/utils/logger";
import { AuthController } from "@/lib/controllers/auth.controller";

const authController = AuthController.getInstance();

export const GET = async (request: NextRequest) => {
  try {
    return await authController.getUserStats(request);
  } catch (error) {
    logger.error("Get user stats error:", error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch user stats",
      },
      { status: 500 }
    );
  }
};
