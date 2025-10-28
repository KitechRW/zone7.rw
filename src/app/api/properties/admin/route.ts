import { NextRequest } from "next/server";
import { PropertyController } from "@/lib/controllers/property.controller";
import { AuthMiddleware } from "@/lib/middleware/auth.middleware";

export const GET = async (request: NextRequest) => {
  const authError = await AuthMiddleware.requireBroker(request);

  if (authError) return authError;

  return PropertyController.getBrokerProperties(request);
};

export const POST = async (request: NextRequest) => {
  const authError = await AuthMiddleware.requireBroker(request);

  if (authError) return authError;

  return PropertyController.createProperty(request);
};
