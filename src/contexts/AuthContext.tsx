"use client";

import { useSession, signOut } from "next-auth/react";
import { UserRole } from "@/lib/utils/permission";
import { UserData } from "@/lib/types/auth";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const user = session?.user as UserData | undefined;
  const isAuthenticated = !!user;
  const isAdmin = user?.role === UserRole.ADMIN;
  const authLoading = status === "loading";

  const logout = async () => {
    await signOut({
      redirect: false,
    });

    router.push("/auth");
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
