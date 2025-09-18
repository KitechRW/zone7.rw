import type { User, NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { AuthService } from "../services/auth.service";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserData } from "../types/auth";
import logger from "../utils/logger";
import { Tokens } from "../utils/tokens";

const authService = AuthService.getInstance();

//In-memory lock to prevent concurrent token refresh attempts
const refreshLocks = new Map<string, Promise<any>>();

async function performTokenRefresh(refreshToken: string, currentToken: JWT) {
  try {
    const newTokens = await authService.refreshTokens(refreshToken);

    if (newTokens) {
      logger.info("Token refresh successful");
      return {
        ...currentToken,
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        accessTokenExpires: newTokens.accessTokenExpires,
        refreshTokenExpires: newTokens.refreshTokenExpires,
      };
    } else {
      logger.warn("Token refresh returned null");
      throw new Error("Token refresh returned null");
    }
  } catch (error) {
    logger.error("Token refresh failed:", error);

    //Checking if the error is specifically about invalid refresh token
    const isInvalidToken =
      error instanceof Error &&
      (error.message.includes("Invalid refresh token") ||
        error.message.includes("refresh token"));

    if (isInvalidToken) {
      logger.info("Invalid refresh token detected, clearing session tokens");
    }

    // Return token with cleared auth data
    return {
      ...currentToken,
      accessToken: "",
      refreshToken: "",
      accessTokenExpires: 0,
      refreshTokenExpires: 0,
      user: currentToken.user,
    };
  }
}

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const { user } = await authService.login({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
            username: user.username,
            provider: user.provider,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          } as UserData;
        } catch (error) {
          logger.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/auth",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn() {
      try {
        return true;
      } catch (error) {
        logger.error("Sign in error:", error);
        return false;
      }
    },

    async jwt({ token, user }: { token: JWT; user: User }) {
      try {
        if (user) {
          const now = Date.now();
          const accessToken = await Tokens.createAccessToken(
            { userId: user.id, type: "access" },
            "15m"
          );
          const refreshToken = Tokens.generateRefreshToken();

          token.accessToken = accessToken;
          token.refreshToken = refreshToken;
          token.accessTokenExpires = now + 15 * 60 * 1000; // 15 minutes
          token.refreshTokenExpires = now + 30 * 24 * 60 * 60 * 1000; // 30 days
          token.user = user as UserData;

          // Store refresh token in database
          await authService.storeRefreshToken(
            user.id,
            refreshToken,
            "NextAuth Session",
            "Web Browser"
          );
        }

        const bufferTime = 30 * 1000; // 30 secs to prevent edge cases
        const currentTime = Date.now();
        const tokenExpiryTime =
          (token.accessTokenExpires as number) - bufferTime;

        //If tokens are already cleared, don't try to refresh
        if (!token.accessToken || !token.refreshToken) {
          return token;
        }

        //Return previous token if access token has not expired yet (with buffer)
        if (currentTime < tokenExpiryTime) {
          return token;
        }

        //If Access token has expired or is about to, update it
        const userId = user?.id || (user as UserData)?.id;
        const currentRefreshToken = token.refreshToken as string;

        if (!userId || !currentRefreshToken) {
          logger.warn("Missing userId or refreshToken for token refresh", {
            hasUserId: !!userId,
            hasRefreshToken: !!currentRefreshToken,
            hasUser: !!token.user,
            userKeys: token.user ? Object.keys(token.user) : [],
            tokenKeys: Object.keys(token).filter(
              (key) => !["user"].includes(key)
            ),
          });
          return {
            ...token,
            accessToken: "",
            refreshToken: "",
            accessTokenExpires: 0,
            refreshTokenExpires: 0,
            user: token.user,
          };
        }

        const lockKey = `${userId}-${currentRefreshToken}`;

        if (refreshLocks.has(lockKey)) {
          try {
            // Wait for the existing refresh to complete
            const result = await refreshLocks.get(lockKey);
            return result || token;
          } catch (error) {
            logger.error("Error waiting for token refresh lock:", error);
            // Fall through to attempt refresh
          }
        }

        // Create a new refresh promise and store it in the lock
        const refreshPromise = performTokenRefresh(currentRefreshToken, token);
        refreshLocks.set(lockKey, refreshPromise);

        try {
          const result = await refreshPromise;
          return result;
        } finally {
          // Always clean up the lock
          refreshLocks.delete(lockKey);
        }
      } catch (error) {
        logger.error("JWT callback error:", error);
        return {
          ...token,
          accessToken: "",
          refreshToken: "",
          accessTokenExpires: 0,
          refreshTokenExpires: 0,
          user: token.user,
        };
      }
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && token.user) {
        session.user = token.user as UserData;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.accessTokenExpires = token.accessTokenExpires as number;
        session.refreshTokenExpires = token.refreshTokenExpires as number;
      }
      return session;
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async signOut({ token }: { token: JWT }) {
      try {
        if ((token?.user as UserData)?.id && token?.refreshToken) {
          await authService.logout(
            (token.user as UserData).id as string,
            token.refreshToken as string
          );
        }
      } catch (error) {
        logger.error("Sign out cleanup error:", error);
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
