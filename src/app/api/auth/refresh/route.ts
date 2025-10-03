import { AuthController } from "@/lib/controllers/auth.controller";
import { NextRequest } from "next/server";

const authController = AuthController.getInstance();

export const POST = async (request: NextRequest) => {
  return authController.refreshToken(request);
};
