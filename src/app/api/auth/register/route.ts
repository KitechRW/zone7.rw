import { NextRequest, NextResponse } from "next/server";
import {
  validate,
  getValidatedData,
} from "@/lib/middleware/validation.middleware";
import { AuthController } from "@/lib/controllers/auth.controller";
import { registerSchema } from "@/lib/schema/auth.schema";

const authController = AuthController.getInstance();
const validationMiddleware = validate(registerSchema, {
  passwordFields: true,
  customNoSQLRules: { password: "lenient" },
});

export const POST = async (request: NextRequest) => {
  try {
    await validationMiddleware(request);

    const validatedData = getValidatedData(request);

    return authController.register(request, validatedData);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Validation failed",
      },
      { status: 400 }
    );
  }
};
