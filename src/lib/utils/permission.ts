import { ApiError } from "./apiError";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
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
