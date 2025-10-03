import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/utils/apiError";
import logger from "@/lib/utils/logger";
import { AuthController } from "@/lib/controllers/auth.controller";

const authController = AuthController.getInstance();

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params;
    return await authController.getUserById(request, { params });
  } catch (error) {
    logger.error("Get user error:", error);

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
          error instanceof Error ? error.message : "Failed to fetch user",
      },
      { status: 500 }
    );
  }
};

export const PUT = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params;
    return await authController.updateUserRole(request, { params });
  } catch (error) {
    logger.error("Update user role error:", error);

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
          error instanceof Error ? error.message : "Failed to update user role",
      },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params;
    return await authController.deleteUser(request, { params });
  } catch (error) {
    logger.error("Delete user error:", error);

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
          error instanceof Error ? error.message : "Failed to delete user",
      },
      { status: 500 }
    );
  }
};
