"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { signOut, useSession } from "next-auth/react";

interface User {
  id: string;
  username: string;
  email: string;
  image?: string;
  provider: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  refreshUserData: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      setAuthLoading(true);
      return;
    }

    if (status === "authenticated" && session?.user) {
      setUser({
        id: session.user.id,
        username: session.user.username,
        email: session.user.email,
        provider: session.user.provider,
      });
    } else {
      setUser(null);
    }

    setAuthLoading(false);
  }, [session, status]);

  const refreshUserData = async () => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });

      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      await signOut({ callbackUrl: "/" });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        authLoading,
        refreshUserData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
