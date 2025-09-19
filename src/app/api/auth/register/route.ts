import { NextRequest, NextResponse } from "next/server";
import {
  validate,
  validateRequest,
} from "@/lib/middleware/validation.middleware";
import { AuthController } from "@/lib/controllers/auth.controller";
import { registerSchema } from "@/lib/schema/auth.schema";
import { ApiError } from "@/lib/utils/apiError";
import { z } from "zod";
import logger from "@/lib/utils/logger";

const authController = AuthController.getInstance();

export const POST = async (request: NextRequest) => {
  try {
    await validateRequest(request, registerSchema, {
      passwordFields: true,
      customNoSQLRules: { password: "lenient" },
    });

    return await authController.register(request);
  } catch (error) {
    logger.error("Registration validation error:", error);

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
        message: error instanceof Error ? error.message : "Registration failed",
      },
      { status: 500 }
    );
  }
};
