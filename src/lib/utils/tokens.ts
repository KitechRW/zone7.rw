import { randomBytes } from "crypto";
import { ApiError } from "./apiError";
import { jwtVerify, SignJWT } from "jose";

export class Tokens {
  private static readonly JWT_SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET
  );

  static generateRefreshToken(): string {
    return randomBytes(64).toString("hex");
  }

  private static getExpirationTime(duration: string): number {
    const now = Math.floor(Date.now() / 1000);
    const match = duration.match(/^(\d+)([smhd])$/);

    if (!match) throw ApiError.badRequest("Invalid duration format");

    const [, amount, unit] = match;
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };

    return (
      now + parseInt(amount) * multipliers[unit as keyof typeof multipliers]
    );
  }

  static async createAccessToken(
    payload: { userId: string; type: string },
    expiresIn: string = "15m"
  ): Promise<string> {
    const expirationTime = this.getExpirationTime(expiresIn);

    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(this.JWT_SECRET);
  }

  static async verifyAccessToken(token: string): Promise<unknown> {
    try {
      const { payload } = await jwtVerify(token, this.JWT_SECRET);
      return payload;
    } catch {
      throw ApiError.badRequest("Invalid token");
    }
  }

  static getTokenExpiration(duration: string): Date {
    const now = new Date();
    const match = duration.match(/^(\d+)([smhd])$/);

    if (!match) {
      throw ApiError.badRequest("Invalid duration format");
    }

    const [, amount, unit] = match;
    const milliseconds =
      parseInt(amount) *
      {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
      }[unit as "s" | "m" | "h" | "d"];

    return new Date(now.getTime() + milliseconds);
  }
}
