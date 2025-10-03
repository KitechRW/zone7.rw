import mongoose from "mongoose";
import DBConnection from "../db/connect";
import { IInterest, Interest } from "../db/models/interest.model";
import { User } from "../db/models/user.model";
import { ApiError } from "../utils/apiError";
import logger from "../utils/logger";
import { CreateInterestData, InterestFilters } from "@/types/Interests";
import { Property } from "../db/models/property.model";
import { EmailService } from "./email.service";

export interface InterestWithDetails extends IInterest {
  userName: string;
  userEmail: string;
  propertyTitle: string;
}

interface RegexCondition {
  $regex: string;
  $options: string;
}

interface LeanInterest {
  _id: mongoose.Types.ObjectId;
  userId: string;
  propertyId: string;
  userPhone: string;
  message?: string;
  status: "new" | "contacted" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

interface LeanUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  role: string;
}

interface LeanProperty {
  _id: mongoose.Types.ObjectId;
  title: string;
  type: "house" | "plot";
  category: "sale" | "rent";
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MatchConditions {
  status?: string;
  message?: RegexCondition;
  createdAt?: {
    $gte?: Date | string;
    $lte?: Date | string;
  };
  $or?: Array<
    | { "user.username": RegexCondition }
    | { "user.email": RegexCondition }
    | { message: RegexCondition }
  >;
}

export class InterestService {
  private static instance: InterestService;

  private constructor() {}

  public static getInstance(): InterestService {
    if (!InterestService.instance) {
      InterestService.instance = new InterestService();
    }
    return InterestService.instance;
  }

  async create(data: CreateInterestData): Promise<InterestWithDetails> {
    try {
      await DBConnection.getInstance().connect();

      // Check if user already has interest in this property
      const existingInterest = await Interest.findOne({
        userId: data.userId,
        propertyId: data.propertyId,
      });

      if (existingInterest) {
        throw ApiError.conflict(
          "You have already placed interest in this property"
        );
      }

      const user = await User.findById(data.userId);
      if (!user) {
        throw ApiError.badRequest("User not found");
      }

      const interest = new Interest({
        userId: data.userId,
        propertyId: data.propertyId,
        userPhone: data.userPhone,
        message: data.message,
        status: "new",
      });

      const savedInterest = await interest.save();

      try {
        const emailService = EmailService.getInstance();
        const property = await Property.findById(data.propertyId)
          .select("title location price category")
          .lean<LeanProperty>();

        if (property) {
          await emailService.sendInterestNotification({
            propertyTitle: property.title,
            propertyLocation: property.location,
            propertyPrice: `Rwf ${property.price.toLocaleString()}`,
            propertyCategory: property.category,
            userName: user.username,
            userEmail: user.email,
            userPhone: data.userPhone,
            message: data.message,
            interestDate: savedInterest.createdAt.toISOString(),
          });
        }
      } catch (emailError) {
        logger.error("Failed to send interest notification email", emailError);
      }

      return {
        ...savedInterest.toObject(),
        userName: user.username,
        userEmail: user.email,
        propertyTitle: await this.getPropertyTitle(data.propertyId),
      };
    } catch (error: unknown) {
      logger.error("Interest creation failed", {
        error: error instanceof Error && error.message,
        data,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name?.includes("Mongo")) {
        if (error.message.includes("duplicate key")) {
          throw ApiError.conflict(
            "You have already placed interest in this property"
          );
        }
        throw ApiError.internalServer(
          "Database error during interest creation"
        );
      }

      throw ApiError.internalServer("Failed to create interest");
    }
  }

  private async getPropertyTitle(propertyId: string): Promise<string> {
    try {
      const property = await Property.findById(propertyId)
        .select("title")
        .lean<LeanProperty>();
      return property?.title || "Property not found";
    } catch (error) {
      logger.error("Failed to get property title", { propertyId, error });
      return "Property unavailable";
    }
  }

  async getAll(
    filters: InterestFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{
    interests: InterestWithDetails[];
    total: number;
    pages: number;
  }> {
    try {
      await DBConnection.getInstance().connect();

      // Build match conditions for filtering
      const matchConditions: MatchConditions = {};

      if (filters.status && filters.status !== "all") {
        matchConditions.status = filters.status;
      }

      if (filters.startDate || filters.endDate) {
        matchConditions.createdAt = {};
        if (filters.startDate) {
          matchConditions.createdAt.$gte = filters.startDate;
        }
        if (filters.endDate) {
          matchConditions.createdAt.$lte = filters.endDate;
        }
      }

      // Get filtered interests
      const interests = await Interest.find(matchConditions)
        .lean<LeanInterest[]>()
        .sort({ createdAt: -1 });

      if (interests.length === 0) {
        return {
          interests: [],
          total: 0,
          pages: 0,
        };
      }

      const userIds = [
        ...new Set(interests.map((interest) => interest.userId)),
      ];

      const users = await User.find({ _id: { $in: userIds } })
        .select("username email")
        .lean<LeanUser[]>();

      // Create user lookup map
      const userMap = new Map(users.map((user) => [user._id.toString(), user]));

      const propertyIds = [
        ...new Set(interests.map((interest) => interest.propertyId)),
      ];

      const propertyTitles = await this.getPropertyTitles(propertyIds);

      const enrichedInterests: InterestWithDetails[] = [];

      for (const interest of interests) {
        const user = userMap.get(interest.userId);
        if (!user) continue; // Skip if user not found

        const enrichedInterest: InterestWithDetails = {
          _id: interest._id.toString(),
          id: interest._id.toString(),
          userId: interest.userId,
          propertyId: interest.propertyId,
          userPhone: interest.userPhone,
          message: interest.message,
          status: interest.status,
          userName: user.username,
          userEmail: user.email,
          propertyTitle:
            propertyTitles.get(interest.propertyId) || "Property not found",
          createdAt: interest.createdAt,
          updatedAt: interest.updatedAt,
        } as InterestWithDetails;

        // Apply search filter if needed
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesSearch =
            user.username.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            (interest.message &&
              interest.message.toLowerCase().includes(searchLower));

          if (matchesSearch) {
            enrichedInterests.push(enrichedInterest);
          }
        } else {
          enrichedInterests.push(enrichedInterest);
        }
      }

      const total = enrichedInterests.length;
      const pages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedInterests = enrichedInterests.slice(
        startIndex,
        startIndex + limit
      );

      return {
        interests: paginatedInterests,
        total,
        pages,
      };
    } catch (error: unknown) {
      logger.error("Failed to fetch interests", {
        error: error instanceof Error && error.message,
        filters,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internalServer("Failed to fetch interests");
    }
  }

  async getUserInterests(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    interests: InterestWithDetails[];
    total: number;
    pages: number;
  }> {
    try {
      await DBConnection.getInstance().connect();

      // Get interests for specific user only
      const interests = await Interest.find({ userId: userId })
        .lean<LeanInterest[]>()
        .sort({ createdAt: -1 });

      if (interests.length === 0) {
        return {
          interests: [],
          total: 0,
          pages: 0,
        };
      }

      // Get user details
      const user = await User.findById(userId)
        .select("username email")
        .lean<LeanUser>();

      if (!user) {
        throw ApiError.notFound("User not found");
      }

      // Get property details
      const propertyIds = [
        ...new Set(interests.map((interest) => interest.propertyId)),
      ];

      const propertyTitles = await this.getPropertyTitles(propertyIds);

      // Enrich interests with user and property data
      const enrichedInterests: InterestWithDetails[] = interests.map(
        (interest) =>
          ({
            _id: interest._id.toString(),
            id: interest._id.toString(),
            userId: interest.userId,
            propertyId: interest.propertyId,
            userPhone: interest.userPhone,
            message: interest.message,
            status: interest.status,
            userName: user.username,
            userEmail: user.email,
            propertyTitle:
              propertyTitles.get(interest.propertyId) || "Property not found",
            createdAt: interest.createdAt,
            updatedAt: interest.updatedAt,
          } as InterestWithDetails)
      );

      // Apply pagination
      const total = enrichedInterests.length;
      const pages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedInterests = enrichedInterests.slice(
        startIndex,
        startIndex + limit
      );

      return {
        interests: paginatedInterests,
        total,
        pages,
      };
    } catch (error: unknown) {
      logger.error("Failed to fetch user interests", {
        error: error instanceof Error && error.message,
        userId,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internalServer("Failed to fetch user interests");
    }
  }

  private async getPropertyTitles(
    propertyIds: string[]
  ): Promise<Map<string, string>> {
    const titleMap = new Map<string, string>();

    try {
      const properties = await Property.find({ _id: { $in: propertyIds } })
        .select("title")
        .lean<LeanProperty[]>();
      properties.forEach((property) => {
        titleMap.set(property._id.toString(), property.title);
      });
    } catch (error) {
      logger.error("Failed to get property titles", { propertyIds, error });
    }

    return titleMap;
  }

  async updateStatus(
    id: string,
    status: "new" | "contacted" | "closed"
  ): Promise<InterestWithDetails> {
    try {
      await DBConnection.getInstance().connect();

      const interest = await Interest.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!interest) {
        throw ApiError.notFound("Interest not found");
      }

      const user = await User.findById(interest.userId);
      if (!user) {
        throw ApiError.notFound("User not found");
      }

      return {
        ...interest.toObject(),
        id: interest._id.toString(),
        userName: user.username,
        userEmail: user.email,
        propertyTitle: "",
      };
    } catch (error: unknown) {
      logger.error("Failed to update interest status", {
        error: error instanceof Error && error.message,
        id,
        status,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internalServer("Failed to update interest status");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await DBConnection.getInstance().connect();

      const interest = await Interest.findByIdAndDelete(id);

      if (!interest) {
        throw ApiError.notFound("Interest not found");
      }
    } catch (error: unknown) {
      logger.error("Failed to delete interest", {
        error: error instanceof Error && error.message,
        id,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internalServer("Failed to delete interest");
    }
  }

  async getStats(): Promise<{
    total: number;
    new: number;
    contacted: number;
    closed: number;
  }> {
    try {
      await DBConnection.getInstance().connect();

      const stats = await Interest.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            new: {
              $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] },
            },
            contacted: {
              $sum: { $cond: [{ $eq: ["$status", "contacted"] }, 1, 0] },
            },
            closed: {
              $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] },
            },
          },
        },
      ]);

      return stats[0] || { total: 0, new: 0, contacted: 0, closed: 0 };
    } catch (error: unknown) {
      logger.error("Failed to get interest stats", {
        error: error instanceof Error && error.message,
      });

      throw ApiError.internalServer("Failed to get interest statistics");
    }
  }

  async getUserInterest(
    userId: string,
    propertyId: string
  ): Promise<IInterest | null> {
    try {
      await DBConnection.getInstance().connect();

      return await Interest.findOne({
        userId,
        propertyId,
      });
    } catch (error: unknown) {
      logger.error("Failed to get user interest", {
        error: error instanceof Error && error.message,
        userId,
        propertyId,
      });

      throw ApiError.internalServer("Failed to check user interest");
    }
  }
}
