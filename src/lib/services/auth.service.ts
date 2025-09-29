import DBConnection from "../db/connect";
import { IUser, User } from "../db/models/user.model";
import {
  AuthTokens,
  LoginCredentials,
  RefreshTokenData,
  RegisterCredentials,
} from "../types/auth";
import { getEmailRole } from "../utils/admin";
import { ApiError } from "../utils/apiError";
import logger from "../utils/logger";
import { Password } from "../utils/password";
import { PasswordGenerator } from "../utils/passwordGenerator";
import { UserRole } from "../utils/permission";
import { Tokens } from "../utils/tokens";
import { EmailService } from "./email.service";

export interface UserFilters {
  role?: UserRole | "all";
  search?: string;
  provider?: "credentials" | "all";
  startDate?: Date;
  endDate?: Date;
}

interface Query {
  role?: string;
  provider?: string;
  $or?: Array<
    | { username?: { $regex: string; $options: string } }
    | { email?: { $regex: string; $options: string } }
  >;
  createdAt?: {
    $gte?: Date | string;
    $lte?: Date | string;
  };
}

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async register(credentials: RegisterCredentials): Promise<IUser> {
    try {
      await DBConnection.getInstance().connect();

      const existingUser = await User.findOne({
        $or: [
          { email: credentials.email.toLowerCase() },
          { username: credentials.username },
        ],
      });

      if (existingUser) {
        if (existingUser.email === credentials.email.toLowerCase()) {
          throw ApiError.conflict("This email already registered");
        }
        throw ApiError.conflict("Username already taken");
      }

      const validatePassword = Password.validate(credentials.password);

      if (!validatePassword.isValid)
        throw ApiError.validationError(validatePassword.errors.join(", "));

      const hashedPassword = await Password.hash(credentials.password);

      const role = getEmailRole(credentials.email);

      const user = new User({
        username: credentials.username.trim(),
        email: credentials.email.toLowerCase().trim(),
        password: hashedPassword,
        provider: "credentials",
        role,
      });

      return await user.save();
    } catch (error: unknown) {
      logger.error(
        "User registration failed",
        error instanceof Error && error.message
      );

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name?.includes("Mongo")) {
        throw ApiError.internalServer("Database error during registration");
      }

      throw ApiError.internalServer("Registration failed");
    }
  }

  async login(
    credentials: LoginCredentials,
    userAgent: string = "",
    device: string = ""
  ): Promise<{ user: IUser; tokens: AuthTokens }> {
    try {
      await DBConnection.getInstance().connect();

      const user = await User.findOne({
        email: credentials.email.toLowerCase(),
      }).select("+password");

      if (!user || !user.password) {
        throw ApiError.badRequest("Invalid email or password");
      }

      const isPasswordValid = await Password.verify(
        credentials.password,
        user.password
      );

      if (!isPasswordValid)
        throw ApiError.badRequest("Invalid email or password");

      // Include role in tokens
      const tokens = await this.generateTokens(user._id.toString());

      await this.storeRefreshToken(
        user._id.toString(),
        tokens.refreshToken,
        userAgent,
        device
      );

      user.lastLoginAt = new Date();
      await user.save();

      user.password = undefined;

      return { user, tokens };
    } catch (error: unknown) {
      logger.error("User login failed", {
        error: error instanceof Error && error.message,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internalServer("Login failed");
    }
  }

  async createAdmin(credentials: {
    username: string;
    email: string;
  }): Promise<IUser> {
    try {
      await DBConnection.getInstance().connect();

      const existingUser = await User.findOne({
        $or: [
          { email: credentials.email.toLowerCase() },
          { username: credentials.username },
        ],
      });

      if (existingUser) {
        if (existingUser.email === credentials.email.toLowerCase()) {
          throw ApiError.conflict("This email is already registered");
        }
        throw ApiError.conflict("Username already taken");
      }

      // Generate a secure random password
      const generatedPassword = PasswordGenerator.generate(12);
      const hashedPassword = await Password.hash(generatedPassword);

      const user = new User({
        username: credentials.username.trim(),
        email: credentials.email.toLowerCase().trim(),
        password: hashedPassword,
        provider: "credentials",
        role: "admin",
      });

      const savedUser = await user.save();

      // Send email with credentials
      const emailService = EmailService.getInstance();
      await emailService.sendAdminCredentials({
        userEmail: credentials.email.toLowerCase().trim(),
        userName: credentials.username.trim(),
        password: generatedPassword,
        loginUrl: `${process.env.NEXT_PUBLIC_COMPANY_URL}/auth`,
      });

      return savedUser;
    } catch (error: unknown) {
      logger.error(
        "Admin creation failed",
        error instanceof Error && error.message
      );

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name?.includes("Mongo")) {
        throw ApiError.internalServer("Database error during admin creation");
      }

      throw ApiError.internalServer("Admin creation failed");
    }
  }

  private async generateTokens(userId: string): Promise<AuthTokens> {
    const accessToken = await Tokens.createAccessToken(
      { userId, type: "access" },
      "15m"
    );

    const refreshToken = Tokens.generateRefreshToken();
    const now = Date.now();

    return {
      accessToken,
      refreshToken,
      accessTokenExpires: now + 15 * 60 * 1000,
      refreshTokenExpires: now + 30 * 24 * 60 * 60 * 1000,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
    try {
      await DBConnection.getInstance().connect();

      const user = await User.findOne({
        "refreshTokens.token": refreshToken,
        "refreshTokens.expiresAt": { $gt: new Date() },
      });

      if (!user) throw ApiError.badRequest("Invalid refresh token");

      const tokens = await this.generateTokens(user._id.toString());

      const tokenIndex = user.refreshTokens.findIndex(
        (t: RefreshTokenData) => t.token === refreshToken
      );

      if (tokenIndex !== -1) {
        const oldToken = user.refreshTokens[tokenIndex];

        user.refreshTokens[tokenIndex] = {
          ...oldToken,
          token: tokens.refreshToken,
          expiresAt: new Date(tokens.refreshTokenExpires),
          createdAt: new Date(),
        };
        await user.save();
      }

      return tokens;
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error("Token refresh failed", {
        error: error instanceof Error && error.message,
      });
      throw ApiError.unauthorized("Token refresh failed");
    }
  }

  async storeRefreshToken(
    userId: string,
    token: string,
    userAgent: string,
    device: string
  ): Promise<void> {
    const expiresAt = Tokens.getTokenExpiration("30d");

    await User.updateOne(
      { _id: userId },
      {
        $push: {
          refreshTokens: {
            $each: [
              { token, expiresAt, userAgent, device, createdAt: new Date() },
            ],
            $slice: -3,
          },
        },
      }
    );
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    try {
      await DBConnection.getInstance().connect();

      if (refreshToken) {
        await User.updateOne(
          { _id: userId },
          { $pull: { refreshTokens: { token: refreshToken } } }
        );
      } else {
        await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
      }
    } catch (error) {
      logger.error("User logout failed");

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internalServer("Logout failed");
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    await DBConnection.getInstance().connect();
    await User.updateMany(
      {},
      {
        $pull: {
          refreshTokens: { expiresAt: { $lt: new Date() } },
        },
      }
    );
  }

  async getUserById(userId: string): Promise<IUser | null> {
    try {
      await DBConnection.getInstance().connect();
      return await User.findById(userId).select("-password -refreshTokens");
    } catch (error) {
      logger.error("Get user by ID failed:", error);
      throw ApiError.internalServer("Failed to fetch user");
    }
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER;
    } catch (error) {
      logger.error("Admin check failed:", error);
      return false;
    }
  }

  async isUserOwner(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return user?.role === UserRole.OWNER;
    } catch (error) {
      logger.error("Owner check failed:", error);
      return false;
    }
  }

  async getAllUsers(
    filters: UserFilters = {},
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<{ users: IUser[]; total: number; pages: number }> {
    try {
      await DBConnection.getInstance().connect();

      const query: Query = {};

      if (filters.role && filters.role !== "all") {
        query["role"] = filters.role;
      }

      if (filters.provider && filters.provider !== "all") {
        query.provider = filters.provider;
      }

      if (filters.search) {
        query.$or = [
          { username: { $regex: filters.search, $options: "i" } },
          { email: { $regex: filters.search, $options: "i" } },
        ];
      }

      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = filters.startDate;
        if (filters.endDate) query.createdAt.$lte = filters.endDate;
      }

      const skip = (page - 1) * limit;

      const rolePriority: Record<string, number> = {
        owner: 0,
        admin: 1,
        user: 2,
      };

      // For default sorting
      if (
        (!filters.search && sortBy === "createdAt" && sortOrder === "desc") ||
        sortBy === "role"
      ) {
        const allUsers = await User.find(query).select(
          "-password -refreshTokens"
        );

        // Custom sort function
        allUsers.sort((a: IUser, b: IUser) => {
          if (
            sortBy === "role" ||
            (!filters.search && sortBy === "createdAt" && sortOrder === "desc")
          ) {
            const roleA = rolePriority[a.role] ?? 3;
            const roleB = rolePriority[b.role] ?? 3;

            if (sortBy === "role") {
              if (sortOrder === "asc") {
                if (roleA !== roleB) return roleA - roleB;
              } else {
                if (roleA !== roleB) return roleB - roleA;
              }
              // Secondary sort by username for same roles
              return a.username.localeCompare(b.username);
            } else {
              if (roleA !== roleB) {
                return roleA - roleB; // Always owner first for default
              }
              return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              );
            }
          }

          // Fallback (shouldn't reach here in this branch)
          return 0;
        });

        // Apply pagination
        const users = allUsers.slice(skip, skip + limit);
        const total = allUsers.length;

        return {
          users,
          total,
          pages: Math.ceil(total / limit),
        };
      } else {
        // For other sorts, use MongoDB sorting
        const sort: Record<string, 1 | -1> = {};
        sort[sortBy] = sortOrder === "desc" ? -1 : 1;

        const [users, total] = await Promise.all([
          User.find(query)
            .select("-password -refreshTokens")
            .sort(sort)
            .skip(skip)
            .limit(limit),
          User.countDocuments(query),
        ]);

        return {
          users,
          total,
          pages: Math.ceil(total / limit),
        };
      }
    } catch (error) {
      logger.error("Get all users failed:", error);
      throw ApiError.internalServer("Failed to fetch users");
    }
  }

  async deleteUser(userId: string, requesterId: string): Promise<boolean> {
    try {
      await DBConnection.getInstance().connect();

      const requester = await this.getUserById(requesterId);
      if (!requester || !this.isUserAdmin(requesterId)) {
        throw ApiError.forbidden("Admin access required");
      }

      if (userId === requesterId) {
        throw ApiError.badRequest("Cannot delete your own account");
      }

      const user = await User.findById(userId);
      if (!user) {
        throw ApiError.notFound("User not found");
      }

      if (
        (user.role === UserRole.ADMIN || user.role === UserRole.OWNER) &&
        requester.role !== UserRole.OWNER
      ) {
        throw ApiError.badRequest(
          "Only owners can delete admin or owner accounts"
        );
      }

      if (user.role === UserRole.OWNER) {
        const ownerCount = await User.countDocuments({ role: UserRole.OWNER });
        if (ownerCount <= 1) {
          throw ApiError.badRequest("Cannot delete the last owner account");
        }
      }

      await User.findByIdAndDelete(userId);
      return true;
    } catch (error) {
      logger.error("Delete user failed:", error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internalServer("Failed to delete user");
    }
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    totalAdmins: number;
    totalOwners: number;
    recentRegistrations: number;
    activeUsers: number;
  }> {
    try {
      await DBConnection.getInstance().connect();

      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        totalAdmins,
        totalOwners,
        recentRegistrations,
        activeUsers,
      ] = await Promise.all([
        User.countDocuments({ role: UserRole.USER }),
        User.countDocuments({ role: UserRole.ADMIN }),
        User.countDocuments({ role: UserRole.OWNER }),
        User.countDocuments({ createdAt: { $gte: lastWeek } }),
        User.countDocuments({ lastLoginAt: { $gte: lastMonth } }),
      ]);

      return {
        totalUsers,
        totalAdmins,
        totalOwners,
        recentRegistrations,
        activeUsers,
      };
    } catch (error) {
      logger.error("Get user stats failed:", error);
      throw ApiError.internalServer("Failed to fetch user statistics");
    }
  }

  async updateUserRole(
    userId: string,
    role: UserRole,
    requesterId: string
  ): Promise<IUser> {
    try {
      await DBConnection.getInstance().connect();

      const requester = await this.getUserById(requesterId);
      if (!requester) {
        throw ApiError.notFound("Requester not found");
      }

      const targetUser = await User.findById(userId);
      if (!targetUser) {
        throw ApiError.notFound("User not found");
      }

      const isRequesterOwner = requester.role === UserRole.OWNER;
      const isRequesterAdmin =
        requester.role === UserRole.ADMIN || isRequesterOwner;

      if (!isRequesterAdmin) {
        throw ApiError.forbidden("Admin access required");
      }

      if (
        (role === UserRole.ADMIN ||
          role === UserRole.OWNER ||
          targetUser.role === UserRole.ADMIN ||
          targetUser.role === UserRole.OWNER) &&
        !isRequesterOwner
      ) {
        throw ApiError.forbidden("Only owners can manage admin or owner roles");
      }

      if (
        userId === requesterId &&
        requester.role === UserRole.OWNER &&
        role !== UserRole.OWNER
      ) {
        const ownerCount = await User.countDocuments({ role: UserRole.OWNER });
        if (ownerCount <= 1) {
          throw ApiError.badRequest("Cannot demote the only owner");
        }
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
      ).select("-password -refreshTokens");

      if (!user) {
        throw ApiError.notFound("User not found");
      }

      return user;
    } catch (error) {
      logger.error("Update user role failed:", error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internalServer("Failed to update user role");
    }
  }

  async updateUserProfile(
    userId: string,
    updates: Record<string, unknown>
  ): Promise<IUser> {
    try {
      await DBConnection.getInstance().connect();

      const allowedUpdates = ["username", "image"];
      const filteredUpdates: Record<string, unknown> = {};

      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      }

      if (Object.keys(filteredUpdates).length === 0) {
        throw ApiError.badRequest("No valid fields to update");
      }

      // Check if username is already taken
      if (filteredUpdates.username) {
        const existingUser = await User.findOne({
          username: filteredUpdates.username,
          _id: { $ne: userId },
        });

        if (existingUser) {
          throw ApiError.conflict("Username already taken");
        }
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { ...filteredUpdates, updatedAt: new Date() },
        { new: true, runValidators: true, select: "-password -refreshTokens" }
      );

      if (!user) {
        throw ApiError.notFound("User not found");
      }

      return user;
    } catch (error: unknown) {
      logger.error("Update user profile failed:", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name?.includes("Mongo")) {
        throw ApiError.internalServer("Database error during profile update");
      }

      throw ApiError.internalServer("Failed to update user profile");
    }
  }

  async getUserSessions(userId: string): Promise<
    Array<{
      device: string;
      userAgent: string;
      createdAt: Date;
      expiresAt: Date;
    }>
  > {
    try {
      await DBConnection.getInstance().connect();

      const user = await User.findById(userId).select("refreshTokens");

      if (!user) {
        throw ApiError.notFound("User not found");
      }

      const now = new Date();
      return user.refreshTokens
        .filter((token: RefreshTokenData) => token.expiresAt > now)
        .map((token: RefreshTokenData) => ({
          device: token.device || "Unknown",
          userAgent: token.userAgent || "Unknown",
          createdAt: token.createdAt,
          expiresAt: token.expiresAt,
        }));
    } catch (error: unknown) {
      logger.error("Get user sessions failed:", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internalServer("Failed to fetch user sessions");
    }
  }
}
