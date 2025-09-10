import { AuthController } from "@/lib/controllers/auth.controller";

const authController = AuthController.getInstance();

export const POST = authController.register;
