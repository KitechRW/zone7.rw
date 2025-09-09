"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
};
