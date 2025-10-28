import { User as NextAuthUser } from "next-auth";
import { UserRole } from "@/lib/utils/permission";

export interface UserData extends NextAuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  provider: "credentials";
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
  refreshTokenExpires: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface CreateBrokerRequest {
  username: string;
  email: string;
}

export interface CreateBrokerCredentials {
  success: true;
  message: string;
  data: {
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt: Date;
    emailSent: boolean;
  };
  requestId: string;
}

export interface AuthSession {
  user: UserData;
  tokens: AuthTokens;
  expires: string;
}

export interface RefreshTokenData {
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  device: string;
  userAgent: string;
}

declare module "next-auth" {
  interface Session {
    user: UserData;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    refreshTokenExpires: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    refreshTokenExpires: number;
    user: UserData;
  }
}
