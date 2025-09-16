import { ApiError } from "./apiError";
import { UserRole } from "./permission";

export const isAdminEmail = (email: string): boolean => {
  return email === process.env.ADMIN_EMAIL;
};

export const getEmailRole = (email: string): UserRole => {
  return isAdminEmail(email) ? UserRole.ADMIN : UserRole.USER;
};

export const requireAdminEmail = (email: string): UserRole => {
  if (isAdminEmail(email)) {
    return UserRole.ADMIN;
  }
  throw ApiError.forbidden("Admin access only");
};

export const requireAdminRole = (role: string): void => {
  if (role !== UserRole.ADMIN) {
    throw ApiError.forbidden("Admin access required");
  }
};
