import { NextRequest } from "next/server";
import { ApiError } from "../utils/apiError";

interface RateLimitEntry {
  requests: number;
  resetTime: number;
}

export class RateLimitMiddleware {
  private static store = new Map<string, RateLimitEntry>();

  static limit(
    options: {
      maxRequests?: number;
      windowMs?: number;
      keyGenerator?: (req: NextRequest) => string;
    } = {}
  ) {
    const {
      maxRequests = 100,
      windowMs = 15 * 60 * 1000, // 15 minutes
      keyGenerator = (req) => this.getClientKey(req),
    } = options;

    return (request: NextRequest) => {
      const key = keyGenerator(request);
      const now = Date.now();

      this.cleanup();

      let entry = this.store.get(key);
      if (!entry || now > entry.resetTime) {
        entry = { requests: 0, resetTime: now + windowMs };
        this.store.set(key, entry);
      }

      // Check if limit exceeded
      if (entry.requests >= maxRequests) {
        const resetIn = Math.ceil((entry.resetTime - now) / 1000);
        throw ApiError.tooManyRequests(
          `Rate limit exceeded. Try again in ${resetIn} seconds.`
        );
      }

      // Increment request count
      entry.requests++;
    };
  }

  private static getClientKey(request: NextRequest): string {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    return `${ip}:${userAgent.slice(0, 50)}`;
  }

  private static cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}
