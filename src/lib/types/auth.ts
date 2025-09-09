import { User as NextAuthUser } from "next-auth";

export interface UserData extends NextAuthUser {
  id: string;
  username: string;
  email: string;
  provider: "credentials" | "google";
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

  interface JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    refreshTokenExpires: number;
    user: UserData;
  }
}
