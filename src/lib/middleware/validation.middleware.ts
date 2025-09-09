import { z } from "zod";

export class ValidationMiddleware {
  private static readonly registerSchema = z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /(?=.*[a-z])/,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        /(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter"
      )
      .regex(/(?=.*\d)/, "Password must contain at least one number")
      .regex(
        /(?=.*[!@#$%^&*])/,
        "Password must contain at least one special character"
      ),
  });

  private static readonly loginSchema = z.object({
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
  });

  private static readonly interestSchema = z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(1000, "Description must be less than 1000 characters"),
    category: z
      .string()
      .min(1, "Category is required")
      .max(50, "Category must be less than 50 characters"),
  });

  static registerValidation(data: unknown): {
    isValid: boolean;
    errors: string[];
  } {
    try {
      this.registerSchema.parse(data);

      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: (error as z.ZodError).issues.map((err) => err.message),
        };
      }
      return { isValid: false, errors: ["Validation failed"] };
    }
  }

  static loginValidation(data: unknown): {
    isValid: boolean;
    errors: string[];
  } {
    try {
      this.loginSchema.parse(data);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: (error as z.ZodError).issues.map((err) => err.message),
        };
      }
      return { isValid: false, errors: ["Validation failed"] };
    }
  }

  // static validateInterest(data: any): { isValid: boolean; errors: string[] } {
  //   try {
  //     this.interestSchema.parse(data);
  //     return { isValid: true, errors: [] };
  //   } catch (error) {
  //     if (error instanceof z.ZodError) {
  //       return {
  //         isValid: false,
  //         errors: error.errors.map(err => err.message)
  //       };
  //     }
  //     return { isValid: false, errors: ['Validation failed'] };
  //   }
  // }
}
