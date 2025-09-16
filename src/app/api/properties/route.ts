import { NextRequest } from "next/server";
import { PropertyController } from "@/lib/controllers/property.controller";

export const POST = async (request: NextRequest) => {
  return await PropertyController.createProperty(request);
};

export const GET = async (request: NextRequest) => {
  return await PropertyController.getProperties(request);
};
