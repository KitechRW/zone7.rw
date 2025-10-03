import { NextRequest, NextResponse } from "next/server";
import { InterestController } from "@/lib/controllers/interest.controller";
import { ApiError } from "@/lib/utils/apiError";
import logger from "@/lib/utils/logger";

const interestController = InterestController.getInstance();

export const GET = async (request: NextRequest) => {
  try {
    return await interestController.checkUserInterest(request);
  } catch (error) {
    logger.error("Check user interest error:", error);

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
            : "Failed to check user interest",
      },
      { status: 500 }
    );
  }
};
