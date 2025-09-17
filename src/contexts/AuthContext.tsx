"use client";

import { useSession, signOut } from "next-auth/react";
import { UserRole } from "@/lib/utils/permission";
import { UserData } from "@/lib/types/auth";

export const useAuth = () => {
  const { data: session, status, update } = useSession();

  const user = session?.user as UserData | undefined;
  const isAuthenticated = !!user;
  const isAdmin = user?.role === UserRole.ADMIN;
  const authLoading = status === "loading";

  const logout = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  const refreshUserData = async () => {
    await update();
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    authLoading,
    refreshUserData,
    logout,
    session,
    accessToken: session?.accessToken as string,
  };
};
