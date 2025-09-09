import DBConnection from "../db/connect";
import { IUser, User } from "../db/models/user.model";
import {
  AuthTokens,
  LoginCredentials,
  RefreshTokenData,
  RegisterCredentials,
} from "../types/auth";
import { ApiError } from "../utils/apiError";
import logger from "../utils/logger";
import { Password } from "../utils/password";
import { Tokens } from "../utils/tokens";

interface GoogleProfile {
  id: string | undefined;
  email: string | undefined;
  name?: string;
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

      //Check whether a user exists
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

      //Create new user
      const user = new User({
        username: credentials.username.trim(),
        email: credentials.email.toLowerCase().trim(),
        password: hashedPassword,
        provider: "credentials",
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

      //Find user with password
      const user = await User.findOne({
        email: credentials.email.toLowerCase(),
      }).select("+password");

      if (!user || !user.password) {
        throw ApiError.badRequest("Invalid email or password");
      }

      //password verification
      const isPasswordValid = await Password.verify(
        credentials.password,
        user.password
      );

      if (!isPasswordValid)
        throw ApiError.badRequest("Invalid email or password");

      const tokens = await this.generateTokens(user._id.toString());

      await this.storeRefreshToken(
        user._id.toString(),
        tokens.refreshToken,
        userAgent,
        device
      );

      //UPdate last login
      user.lastLoginAt = new Date();
      await user.save();

      user.password = undefined; //Removing the password from response

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
      accessTokenExpires: now + 15 * 60 * 1000, //15 min
      refreshTokenExpires: now + 30 * 24 * 60 * 60 * 1000, //30 days
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

      //Generate new ones
      const tokens = await this.generateTokens(user._id.toString());

      // Replace old refresh token with new one
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
            $slice: -10,
          },
        },
      }
    );
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    try {
      await DBConnection.getInstance().connect();

      if (refreshToken) {
        //Remove specific refresh token
        await User.updateOne(
          { id: userId },
          { $pull: { refreshTokens: { token: refreshToken } } }
        );
      } else {
        //Remove all refresh tokens => Logout from all devices
        await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
      }
    } catch (error) {
      logger.error("User logout failed");

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.internalServer("Login failed");
    }
  }

  //GOOGLE
  async googleUser(profile: GoogleProfile): Promise<IUser> {
    await DBConnection.getInstance().connect();

    let user = await User.findOne({
      $or: [{ googleId: profile.id }, { email: profile.email }],
    });

    if (user) {
      if (!user.googleId && profile.id) {
        user.googleId = profile.id;
        user.provider = "google";
        await user.save();
      }
      return user;
    } //Updating google ID if not set

    //Create new user
    user = new User({
      username:
        profile.name?.replace(/\s+/g, "_").toLowerCase() ||
        profile.email?.split("@")[0],
      email: profile.email?.toLowerCase(),
      provider: "google",
      googleId: profile.id,
      emailVerified: new Date(),
    });

    return await user.save();
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
}
