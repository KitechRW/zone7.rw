import { z, ZodSchema } from "zod";
import { ApiError } from "../utils/apiError";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { NextRequest, NextResponse } from "next/server";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

interface ValidationOptions {
  passwordFields?: boolean;
  customNoSQLRules?: { [field: string]: "strict" | "lenient" | "none" };
  property?: "body" | "query" | "params";
}

export const validate = (
  schema: ZodSchema,
  options: ValidationOptions = {}
) => {
  return async (request: NextRequest): Promise<NextResponse> => {
    const property = options.property || "body";

    // Get data from request based on property type
    let data: unknown;

    if (property === "body") {
      try {
        data = await request.json();
      } catch {
        data = {};
      }
    } else if (property === "query") {
      const url = new URL(request.url);
      data = Object.fromEntries(url.searchParams.entries());
    } else if (property === "params") {
      // Params are typically passed separately, might need to extract these from the route parameters
      data = {};
    }

    //NoSQL injection protection against dangerous operators
    const sanitizeNoSQL = (value: unknown, fieldPath: string = ""): unknown => {
      const fieldName = fieldPath.split(".").pop()?.toLowerCase() || "";

      const customRule =
        options.customNoSQLRules?.[fieldPath] ||
        options.customNoSQLRules?.[fieldName];

      if (customRule === "none") {
        return value;
      }

      if (typeof value === "string") {
        const isPasswordField =
          fieldName.includes("password") ||
          fieldName.includes("token") ||
          fieldName === "confirmpassword";

        if (
          (isPasswordField && options.passwordFields) ||
          customRule === "lenient"
        ) {
          return value
            .replace(
              /\$(?:eq|ne|gt|gte|lt|lte|in|nin|exists|type|regex|where|elemMatch|size|all|mod|nor|and|or|not)\b/gi,
              ""
            )
            .replace(/\$\./g, "");
        } else {
          return value.replace(/[\${}]/g, "");
        }
      }

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const sanitized: Record<string, unknown> = {};
        let hasValidKeys = false;

        for (const [key, val] of Object.entries(value)) {
          if (key.startsWith("$")) {
            console.warn(`Blocked potential NoSQL injection: key "${key}"`);
            continue;
          }

          const newFieldPath = fieldPath ? `${fieldPath}.${key}` : key;
          sanitized[key] = sanitizeNoSQL(val, newFieldPath);
          hasValidKeys = true;
        }

        return hasValidKeys ? sanitized : undefined;
      }

      if (Array.isArray(value)) {
        return value.map((item, index) =>
          sanitizeNoSQL(item, `${fieldPath}[${index}]`)
        );
      }

      return value;
    };

    const sanitizeXSS = (value: unknown): unknown => {
      if (typeof value === "string") {
        return purify.sanitize(value.trim(), { ALLOWED_TAGS: [] });
      }
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const sanitized: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value)) {
          sanitized[key] = sanitizeXSS(val);
        }
        return sanitized;
      }
      if (Array.isArray(value)) {
        return value.map(sanitizeXSS);
      }
      return value;
    };

    // Apply sanitization
    const noSqlSanitized = sanitizeNoSQL(data);
    const sanitizedData = sanitizeXSS(noSqlSanitized);

    // Validate with Zod
    try {
      const validatedData = schema.parse(sanitizedData);

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-validated-data", JSON.stringify(validatedData));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");

        throw ApiError.validationError(errorMessage);
      }

      // Re-throw if it's not a Zod error
      throw error;
    }
  };
};

//Function to extract validated data in API routes
export const getValidatedData = <T>(request: NextRequest): T => {
  const validatedData = request.headers.get("x-validated-data");
  if (!validatedData) {
    throw ApiError.badRequest("No validated data found");
  }
  return JSON.parse(validatedData) as T;
};
