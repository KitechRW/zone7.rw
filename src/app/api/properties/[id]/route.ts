import { NextRequest } from "next/server";
import { PropertyController } from "@/lib/controllers/property.controller";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const url = new URL(request.url);

  url.searchParams.set("id", id);
  const newRequest = new NextRequest(url, request);
  return await PropertyController.getProperty(newRequest);
};

export const PUT = async (request: NextRequest) => {
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
  return await PropertyController.deleteProperty(newRequest);
};
