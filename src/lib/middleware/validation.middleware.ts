import { ZodSchema } from "zod";
import { ApiError } from "../utils/apiError";
import { NextRequest } from "next/server";
import { sanitizeAndValidate } from "../utils/sanitization";

interface ValidationOptions {
  passwordFields?: boolean;
  customNoSQLRules?: { [field: string]: "strict" | "lenient" | "none" };
  property?: "body" | "query" | "params";
}

export const validateRequest = async <T>(
  request: NextRequest,
  schema: ZodSchema<T>,
  options: ValidationOptions = {}
): Promise<T> => {
  const property = options.property || "body";

  //Get data from request based on property type
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
    data = {};
  }

  const validatedData = sanitizeAndValidate<T>(data, schema, options);

  const headers = request.headers as Headers;
  headers.set("x-validated-data", JSON.stringify(validatedData));

  return validatedData;
};

export const validate = (
  schema: ZodSchema,
  options: ValidationOptions = {}
) => {
  return async (request: NextRequest): Promise<void> => {
    await validateRequest(request, schema, options);
  };
};

export const getValidatedData = <T>(request: NextRequest): T => {
  const validatedData = request.headers.get("x-validated-data");
  if (!validatedData) {
    throw ApiError.badRequest("No validated data found");
  }
  try {
    return JSON.parse(validatedData) as T;
  } catch {
    throw ApiError.badRequest("Invalid validated data format");
  }
};
