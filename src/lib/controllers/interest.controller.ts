import { NextRequest, NextResponse } from "next/server";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { ErrorMiddleware } from "../middleware/error.middleware";
import { getValidatedData } from "../middleware/validation.middleware";
import { ApiError } from "../utils/apiError";
import { InterestService } from "../services/interest.service";
import { CreateInterestData } from "../schema/interest.schema";
import { InterestFilters } from "@/types/Interests";

export class InterestController {
  private static instance: InterestController;
  private interestService: InterestService;

  private constructor() {
    this.interestService = InterestService.getInstance();
  }

  public static getInstance(): InterestController {
    if (!InterestController.instance) {
      InterestController.instance = new InterestController();
    }
    return InterestController.instance;
  }

  create = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const userId = request.headers.get("x-user-id") || undefined;

      const data = getValidatedData<CreateInterestData>(request);

      if (userId && data.userId && data.userId !== userId) {
        throw ApiError.forbidden("Cannot create interest for another user");
      }

      //Set userId from auth header if authenticated
      const interestData = {
        ...data,
        userId: userId || data.userId,
      };

      const interest = await this.interestService.create(interestData);

      return NextResponse.json(
        {
          success: true,
          requestId,
          message: "Interest placed successfully",
          data: { interest },
        },
        { status: 201 }
      );
    }
  );

  getAll = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const authError = await AuthMiddleware.requireBroker(request);
      if (authError) return authError;

      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const limit = parseInt(url.searchParams.get("limit") || "10", 10);

      const filters: InterestFilters = {
        status:
          (url.searchParams.get("status") as InterestFilters["status"]) ||
          "all",
        search: url.searchParams.get("search") || undefined,
        startDate: url.searchParams.get("startDate")
          ? new Date(url.searchParams.get("startDate")!)
          : undefined,
        endDate: url.searchParams.get("endDate")
          ? new Date(url.searchParams.get("endDate")!)
          : undefined,
      };

      const result = await this.interestService.getAll(filters, page, limit);

      return NextResponse.json(
        {
          success: true,
          requestId,
          data: result,
        },
        { status: 200 }
      );
    }
  );

  getUserInterests = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const authError = await AuthMiddleware.requireAuth(request);
      if (authError) return authError;

      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const limit = parseInt(url.searchParams.get("limit") || "10", 10);

      const queryUserId = url.searchParams.get("userId");
      const authUserId = request.headers.get("x-user-id")!;

      const targetUserId = queryUserId || authUserId;

      if (!targetUserId) {
        throw ApiError.badRequest("User ID is required");
      }

      const result = await this.interestService.getUserInterests(
        targetUserId,
        page,
        limit
      );

      return NextResponse.json(
        {
          success: true,
          requestId,
          data: result,
        },
        { status: 200 }
      );
    }
  );

  getInterestsByEmail = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const url = new URL(request.url);

      const email = url.searchParams.get("email");
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const limit = parseInt(url.searchParams.get("limit") || "10", 10);

      if (!email) {
        throw ApiError.badRequest("Email is required");
      }

      const result = await this.interestService.getInterestsByEmail(
        email,
        page,
        limit
      );

      return NextResponse.json(
        {
          success: true,
          requestId,
          data: result,
        },
        { status: 200 }
      );
    }
  );

  updateStatus = ErrorMiddleware.catchAsync(
    async (
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ): Promise<NextResponse> => {
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const authError = await AuthMiddleware.requireBroker(request);
      if (authError) return authError;

      const data = getValidatedData<{ status: "new" | "contacted" | "closed" }>(
        request
      );

      const { id } = await params;

      const interest = await this.interestService.updateStatus(id, data.status);

      return NextResponse.json(
        {
          success: true,
          requestId,
          message: "Interest status updated successfully",
          data: { interest },
        },
        { status: 200 }
      );
    }
  );

  delete = ErrorMiddleware.catchAsync(
    async (
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ): Promise<NextResponse> => {
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const authError = await AuthMiddleware.requireAuth(request);
      if (authError) return authError;

      const { id } = await params;
      await this.interestService.delete(id);

      return NextResponse.json(
        {
          success: true,
          requestId,
          message: "Interest removed successfully",
        },
        { status: 200 }
      );
    }
  );

  getStats = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const authError = await AuthMiddleware.requireBroker(request);
      if (authError) return authError;

      const stats = await this.interestService.getStats();

      return NextResponse.json(
        {
          success: true,
          requestId,
          data: { stats },
        },
        { status: 200 }
      );
    }
  );

  checkUserInterest = ErrorMiddleware.catchAsync(
    async (request: NextRequest): Promise<NextResponse> => {
      const requestId =
        request.headers.get("x-request-id") ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const userId = request.headers.get("x-user-id");
      const url = new URL(request.url);
      const propertyId = url.searchParams.get("propertyId");
      const userEmail = url.searchParams.get("userEmail");

      if (!propertyId) {
        throw ApiError.badRequest("Property ID is required");
      }

      const userIdentifier = userId || userEmail;

      //Return no interest instead of error
      if (!userIdentifier) {
        return NextResponse.json(
          {
            success: true,
            requestId,
            data: {
              hasInterest: false,
              interest: null,
            },
          },
          { status: 200 }
        );
      }

      const interest = await this.interestService.getUserInterest(
        userIdentifier,
        propertyId
      );

      return NextResponse.json(
        {
          success: true,
          requestId,
          data: {
            hasInterest: !!interest,
            interest: interest || null,
          },
        },
        { status: 200 }
      );
    }
  );
}
