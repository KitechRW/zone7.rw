import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/middleware/validation.middleware";
import { ApiError } from "@/lib/utils/apiError";
import { z } from "zod";
import logger from "@/lib/utils/logger";
import { PasswordResetController } from "@/lib/controllers/reset.controller";
import { resetPasswordSchema } from "@/lib/schema/reset.schema";

const passwordResetController = PasswordResetController.getInstance();

export const POST = async (request: NextRequest) => {
  try {
    await validateRequest(request, resetPasswordSchema, {
      passwordFields: true,
      customNoSQLRules: { newPassword: "lenient" },
    });

    return await passwordResetController.resetPassword(request);
  } catch (error) {
    logger.error("Reset password validation error:", error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      return NextResponse.json(
        {
          success: false,
          message: `Validation failed: ${errorMessage}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to reset password",
      },
      { status: 500 }
    );
  }
};
