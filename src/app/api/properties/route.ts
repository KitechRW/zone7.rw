import { NextRequest } from "next/server";
import { PropertyController } from "@/lib/controllers/property.controller";

export const GET = async (request: NextRequest) => {
  return await PropertyController.getProperties(request);
};
