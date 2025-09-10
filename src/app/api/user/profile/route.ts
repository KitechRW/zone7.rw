import DBConnection from "@/lib/db/connect";
import { User } from "@/lib/db/models/user.model";
import { AuthMiddleware } from "@/lib/middleware/auth.middleware";
import logger from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const authError = await AuthMiddleware.requireAuth(request);
    if (authError) return authError;

    const userId = request.headers.get("x-user-id");

    await DBConnection.getInstance().connect();

    const user = await User.findById(userId).select("-password -refreshTokens");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          image: user.image,
          provider: user.provider,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    logger.error("Profile fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          (error instanceof Error && error.message) ||
          "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
};

export const PUT = async (request: NextRequest) => {
  try {
    const authError = await AuthMiddleware.requireAuth(request);
    if (authError) return authError;

    const userId = request.headers.get("x-user-id");
    const body = await request.json();

    await DBConnection.getInstance().connect();

    const allowedUpdates = ["username"];
    const updates: Record<string, unknown> = {};

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    //Checking if username is already taken when updating
    if (updates.username) {
      const existingUser = await User.findOne({
        username: updates.username,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Username already taken" },
          { status: 400 }
        );
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updates, updatedAt: new Date() },
      { new: true, select: "-password -refreshTokens" }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          image: user.image,
          provider: user.provider,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    logger.error("Profile update error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          (error instanceof Error && error.message) ||
          "Failed to update profile",
      },
      { status: 500 }
    );
  }
};
