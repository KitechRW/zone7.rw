import { AuthController } from "@/lib/controllers/auth.controller";
import { AuthMiddleware } from "@/lib/middleware/auth.middleware";
import { NextRequest } from "next/server";

const authController = AuthController.getInstance();

export const POST = async (request: NextRequest) => {
  const authError = await AuthMiddleware.requireAuth(request);

  if (authError) {
    return authError;
  }

  return authController.logout(request);
};
