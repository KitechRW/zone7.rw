import { ApiError } from "./apiError";

export enum UserRole {
  USER = "user",
  BROKER = "broker",
  ADMIN = "admin",
}

const rolePermissions = {
  [UserRole.USER]: {
    properties: ["read"],
    profile: ["read", "update"],
    interests: ["create", "read", "delete"],
  },
  [UserRole.BROKER]: {
    properties: ["read", "create", "update", "delete"],
    users: ["read", "update", "delete"],
    profile: ["read", "update"],
    interests: ["read", "delete"],
    broker: ["access"],
  },
  [UserRole.ADMIN]: {
    properties: ["read", "create", "update", "delete"],
    users: ["read", "update", "delete", "promote", "demote"],
    profile: ["read", "update"],
    interests: ["read", "delete"],
    broker: ["access"],
    admin: ["access"],
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
    if (targetRole === UserRole.BROKER || targetRole === UserRole.ADMIN) {
      return requesterRole === UserRole.ADMIN;
    }
    // brokers and admins can manage regular users
    return (
      requesterRole === UserRole.BROKER || requesterRole === UserRole.ADMIN
    );
  }
  return false;
};

export const isBrokerOrAdmin = (role: UserRole): boolean => {
  return role === UserRole.BROKER || role === UserRole.ADMIN;
};

export const isadmin = (role: UserRole): boolean => {
  return role === UserRole.ADMIN;
};
