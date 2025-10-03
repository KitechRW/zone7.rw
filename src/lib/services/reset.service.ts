import DBConnection from "../db/connect";
import { User } from "../db/models/user.model";
import { ApiError } from "../utils/apiError";
import { Password } from "../utils/password";
import logger from "../utils/logger";
import { EmailService } from "./email.service";
import crypto from "crypto";
import { PasswordReset } from "../db/models/reset.model";

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export class PasswordResetService {
  private static instance: PasswordResetService;

  private constructor() {}

  public static getInstance(): PasswordResetService {
    if (!PasswordResetService.instance) {
      PasswordResetService.instance = new PasswordResetService();
    }
    return PasswordResetService.instance;
  }

  async initiatePasswordReset(data: ForgotPasswordData): Promise<void> {
    try {
      await DBConnection.getInstance().connect();

      const user = await User.findOne({ email: data.email.toLowerCase() });

      if (!user) {
        logger.info("Password reset attempted for non-existent email", {
          email: data.email,
        });
        return;
      }

      // Check for existing unexpired token
      const existingToken = await PasswordReset.findOne({
        userId: user._id,
        used: false,
        expiresAt: { $gt: new Date() },
      });

      if (existingToken) {
        // If token was created less than 2 minutes ago, don't send new one
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        if (existingToken.createdAt > twoMinutesAgo) {
          logger.info("Password reset rate limited", {
            email: data.email,
            userId: user._id,
          });
          return;
        }

        // Invalidate existing token
        await PasswordReset.findByIdAndUpdate(existingToken._id, {
          used: true,
        });
      }

      // Generate secure token
      const token = crypto.randomBytes(32).toString("hex");

      // Create password reset record
      const passwordReset = new PasswordReset({
        userId: user._id,
        token,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        used: false,
      });

      await passwordReset.save();

      const resetLink = `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/auth/reset-password?token=${token}`;

      try {
        const emailService = EmailService.getInstance();
        await emailService.sendPasswordReset({
          userEmail: user.email,
          userName: user.username,
          resetLink,
        });

        logger.info("Password reset email sent", {
          email: user.email,
          userId: user._id,
        });
      } catch (emailError) {
        logger.error("Failed to send password reset email", {
          error:
            emailError instanceof Error ? emailError.message : "Unknown error",
          email: user.email,
          userId: user._id,
        });
      }
    } catch (error: unknown) {
      logger.error("Password reset initiation failed", {
        error: error instanceof Error && error.message,
        email: data.email,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internalServer("Failed to initiate password reset");
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      await DBConnection.getInstance().connect();

      // Find valid password reset token
      const passwordReset = await PasswordReset.findOne({
        token: data.token,
        used: false,
        expiresAt: { $gt: new Date() },
      });

      if (!passwordReset) {
        throw ApiError.badRequest("Invalid or expired reset token");
      }

      const user = await User.findById(passwordReset.userId);
      if (!user) {
        throw ApiError.badRequest("User not found");
      }

      const passwordValidation = Password.validate(data.newPassword);
      if (!passwordValidation.isValid) {
        throw ApiError.validationError(passwordValidation.errors.join(", "));
      }

      const hashedPassword = await Password.hash(data.newPassword);

      await User.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        refreshTokens: [],
      });

      await PasswordReset.findByIdAndUpdate(passwordReset._id, {
        used: true,
      });

      // Clean up expired tokens
      // await PasswordReset.cleanupExpiredTokens();

      logger.info("Password successfully reset", {
        userId: user._id,
        email: user.email,
      });
    } catch (error: unknown) {
      logger.error("Password reset failed", {
        error: error instanceof Error && error.message,
        token: data.token ? "provided" : "missing",
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internalServer("Failed to reset password");
    }
  }

  async validateResetToken(
    token: string
  ): Promise<{ isValid: boolean; email?: string }> {
    try {
      await DBConnection.getInstance().connect();

      const passwordReset = await PasswordReset.findOne({
        token,
        used: false,
        expiresAt: { $gt: new Date() },
      });

      if (!passwordReset) {
        return { isValid: false };
      }

      const user = await User.findById(passwordReset.userId);
      if (!user) {
        return { isValid: false };
      }

      return {
        isValid: true,
        email: user.email,
      };
    } catch (error: unknown) {
      logger.error("Token validation failed", {
        error: error instanceof Error && error.message,
        token: token ? "provided" : "missing",
      });

      return { isValid: false };
    }
  }
}
