import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/middleware/validation.middleware";
import { InterestController } from "@/lib/controllers/interest.controller";
import { createInterestSchema } from "@/lib/schema/interest.schema";
import { ApiError } from "@/lib/utils/apiError";
import { z } from "zod";
import logger from "@/lib/utils/logger";

const interestController = InterestController.getInstance();

export const POST = async (request: NextRequest) => {
  try {
    await validateRequest(request, createInterestSchema);
    return await interestController.create(request);
  } catch (error) {
    logger.error("Create interest validation error:", error);

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
        message:
          error instanceof Error ? error.message : "Failed to create interest",
      },
      { status: 500 }
    );
  }
};

export const GET = async (request: NextRequest) => {
  try {
    return await interestController.getAll(request);
  } catch (error) {
    logger.error("Get interests error:", error);

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
          error instanceof Error ? error.message : "Failed to fetch interests",
      },
      { status: 500 }
    );
  }
};
