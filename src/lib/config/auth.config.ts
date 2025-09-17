import type { User, NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { AuthService } from "../services/auth.service";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserData } from "../types/auth";
import logger from "../utils/logger";
import { Tokens } from "../utils/tokens";

const authService = AuthService.getInstance();

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

        // Return previous token if access token has not expired yet
        if (Date.now() < (token.accessTokenExpires as number)) {
          return token;
        }

        // Access token has expired, trying to update it
        try {
          const newTokens = await authService.refreshTokens(
            token.refreshToken as string
          );
          if (newTokens) {
            token.accessToken = newTokens.accessToken;
            token.refreshToken = newTokens.refreshToken;
            token.accessTokenExpires = newTokens.accessTokenExpires;
            token.refreshTokenExpires = newTokens.refreshTokenExpires;
            return token;
          }
        } catch (error) {
          logger.error("Token refresh failed:", error);
        }

        // Refresh token is invalid or expired
        return {
          ...token,
          accessToken: "",
          refreshToken: "",
          accessTokenExpires: 0,
          refreshTokenExpires: 0,
          user: token.user,
        };
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
