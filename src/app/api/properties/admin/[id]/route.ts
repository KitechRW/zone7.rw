import { PropertyController } from "@/lib/controllers/property.controller";
import { AuthMiddleware } from "@/lib/middleware/auth.middleware";
import { NextRequest } from "next/server";

export const PUT = async (request: NextRequest) => {
  const authError = await AuthMiddleware.requireBroker(request);

  if (authError) return authError;
  return await PropertyController.updateProperty(request);
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const url = new URL(request.url);

  url.searchParams.set("id", id);
  const newRequest = new NextRequest(url, request);

  const authError = await AuthMiddleware.requireBroker(request);

  if (authError) return authError;

  return await PropertyController.deleteProperty(newRequest);
};
