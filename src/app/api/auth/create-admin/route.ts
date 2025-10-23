import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/middleware/validation.middleware";
import { AuthController } from "@/lib/controllers/auth.controller";
import { AuthMiddleware } from "@/lib/middleware/auth.middleware";
import { ApiError } from "@/lib/utils/apiError";
import { z } from "zod";
import logger from "@/lib/utils/logger";
import { createBrokerSchema } from "@/lib/schema/auth.schema";

const authController = AuthController.getInstance();

export const POST = async (request: NextRequest) => {
  try {
    const authError = await AuthMiddleware.requireAdmin(request);
    if (authError) return authError;

    await validateRequest(request, createBrokerSchema, {
      passwordFields: false,
    });

    return await authController.createBroker(request);
  } catch (error) {
    logger.error("Create admin validation error:", error);

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
        message: error instanceof Error ? error.message : "Create admin failed",
      },
      { status: 500 }
    );
  }
};
