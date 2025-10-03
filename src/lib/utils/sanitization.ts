import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import logger from "./logger";
import { ZodSchema } from "zod";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

interface SanitizationOptions {
  passwordFields?: boolean;
  customNoSQLRules?: { [field: string]: "strict" | "lenient" | "none" };
}

export const sanitizeNoSQL = (
  value: unknown,
  fieldPath: string = "",
  options: SanitizationOptions = {}
): unknown => {
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

  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const sanitized: Record<string, unknown> = {};
    let hasValidKeys = false;

    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$")) {
        logger.warn(`Blocked potential NoSQL injection: key "${key}"`);
        continue;
      }

      const newFieldPath = fieldPath ? `${fieldPath}.${key}` : key;
      sanitized[key] = sanitizeNoSQL(val, newFieldPath, options);
      hasValidKeys = true;
    }

    return hasValidKeys ? sanitized : undefined;
  }

  if (Array.isArray(value)) {
    return value.map((item, index) =>
      sanitizeNoSQL(item, `${fieldPath}[${index}]`, options)
    );
  }

  return value;
};

export const sanitizeXSS = (value: unknown): unknown => {
  if (typeof value === "string") {
    return purify.sanitize(value.trim(), { ALLOWED_TAGS: [] });
  }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
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

export const sanitizeAndValidate = <T>(
  data: unknown,
  schema: ZodSchema,
  options: SanitizationOptions = {}
): T => {
  const noSqlSanitized = sanitizeNoSQL(data, "", options);
  const sanitizedData = sanitizeXSS(noSqlSanitized);

  // Validate with Zod
  return schema.parse(sanitizedData) as T;
};
