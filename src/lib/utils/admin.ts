import { ApiError } from "./apiError";
import { UserRole } from "./permission";

export const isOwnerEmail = (email: string): boolean => {
  return email === process.env.OWNER_EMAIL;
};

export const getEmailRole = (email: string): UserRole => {
  return isOwnerEmail(email) ? UserRole.OWNER : UserRole.USER;
};

export const requireOwnerEmail = (email: string): UserRole => {
  if (isOwnerEmail(email)) {
    return UserRole.OWNER;
  }
  throw ApiError.forbidden("Owner access only");
};

export const requireOwnerRole = (role: string): void => {
  if (role !== UserRole.OWNER) {
    throw ApiError.forbidden("Owner access required");
  }
};
