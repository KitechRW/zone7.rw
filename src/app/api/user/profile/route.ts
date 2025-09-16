import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/utils/apiError";
import logger from "@/lib/utils/logger";
import { AuthController } from "@/lib/controllers/auth.controller";

const authController = AuthController.getInstance();

export const GET = async (request: NextRequest) => {
  try {
    return await authController.getProfile(request);
  } catch (error) {
    logger.error("Profile fetch error:", error);

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
          error instanceof Error ? error.message : "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
};

export const PUT = async (request: NextRequest) => {
  try {
    return await authController.updateProfile(request);
  } catch (error) {
    logger.error("Profile update error:", error);

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
          error instanceof Error ? error.message : "Failed to update profile",
      },
      { status: 500 }
    );
  }
};
