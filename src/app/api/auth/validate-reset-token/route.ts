import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/utils/apiError";
import logger from "@/lib/utils/logger";
import { PasswordResetController } from "@/lib/controllers/reset.controller";

const passwordResetController = PasswordResetController.getInstance();

export const GET = async (request: NextRequest) => {
  try {
    return await passwordResetController.validateToken(request);
  } catch (error) {
    logger.error("Validate reset token error:", error);

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
        message: "Failed to validate reset token",
      },
      { status: 500 }
    );
  }
};
