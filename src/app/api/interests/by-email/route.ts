import { InterestController } from "@/lib/controllers/interest.controller";
import { ApiError } from "@/lib/utils/apiError";
import logger from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";

const controller = InterestController.getInstance();

export const GET = async (request: NextRequest) => {
  try {
    return controller.getInterestsByEmail(request);
  } catch (error) {
    logger.error("Error getting inteests by email:", error);

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
          error instanceof Error
            ? error.message
            : "Failed to fetch interests by email",
      },
      { status: 500 }
    );
  }
};
