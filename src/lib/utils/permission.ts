import { ApiError } from "./apiError";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  OWNER = "owner",
}

const rolePermissions = {
  [UserRole.USER]: {
    properties: ["read"],
    profile: ["read", "update"],
    interests: ["create", "read", "delete"],
  },
  [UserRole.ADMIN]: {
    properties: ["read", "create", "update", "delete"],
    users: ["read", "update", "delete"],
    profile: ["read", "update"],
    interests: ["read", "delete"],
    admin: ["access"],
  },
  [UserRole.OWNER]: {
    properties: ["read", "create", "update", "delete"],
    users: ["read", "update", "delete", "promote", "demote"],
    profile: ["read", "update"],
    interests: ["read", "delete"],
    admin: ["access"],
    owner: ["access"],
  },
};

export const checkPermission = (
  role: UserRole,
  resource: string,
  action: string
): boolean => {
  if (!rolePermissions[role]) {
    return false;
  }

  const resourcePermissions =
    rolePermissions[role][resource as keyof (typeof rolePermissions)[UserRole]];

  if (!resourcePermissions) {
    return false;
  }

  return resourcePermissions.includes(action);
};

export const requirePermission = (
  role: UserRole,
  resource: string,
  action: string
): void => {
  if (!checkPermission(role, resource, action)) {
    throw ApiError.forbidden("Insufficient permissions");
  }
};

export const canManageRole = (
  requesterRole: UserRole,
  targetRole: UserRole,
  action: "promote" | "demote"
): boolean => {
  if (action === "promote" || action === "demote") {
    if (targetRole === UserRole.ADMIN || targetRole === UserRole.OWNER) {
      return requesterRole === UserRole.OWNER;
    }
    // Admins and owners can manage regular users
    return requesterRole === UserRole.ADMIN || requesterRole === UserRole.OWNER;
  }
  return false;
};

export const isAdminOrOwner = (role: UserRole): boolean => {
  return role === UserRole.ADMIN || role === UserRole.OWNER;
};

export const isOwner = (role: UserRole): boolean => {
  return role === UserRole.OWNER;
};
