import { NextRequest, NextResponse } from "next/server";
import {
  validate,
  validateRequest,
} from "@/lib/middleware/validation.middleware";
import { AuthController } from "@/lib/controllers/auth.controller";
import { loginSchema } from "@/lib/schema/auth.schema";
import { ApiError } from "@/lib/utils/apiError";
import { z } from "zod";
import logger from "@/lib/utils/logger";

const authController = AuthController.getInstance();
const validationMiddleware = validate(loginSchema, {
  passwordFields: true,
  customNoSQLRules: { password: "lenient" },
});

export const POST = async (request: NextRequest) => {
  try {
    await validateRequest(request, loginSchema, {
      passwordFields: true,
      customNoSQLRules: { password: "lenient" },
    });

    return await authController.login(request);
  } catch (error) {
    logger.error("Login validation error:", error);

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
        message: error instanceof Error ? error.message : "Login failed",
      },
      { status: 500 }
    );
  }
};
