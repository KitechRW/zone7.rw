import { NextRequest } from "next/server";
import { InterestController } from "@/lib/controllers/interest.controller";

const interestController = InterestController.getInstance();

export const GET = async (request: NextRequest) => {
  return await interestController.getUserInterests(request);
};
