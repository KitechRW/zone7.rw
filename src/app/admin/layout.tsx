"use client";

import Loader from "@/components/misc/Loader";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">
            You don&#39;t have permission to access this page.
          </p>
        </div>
        <button>
          <Link
            href="/"
            className="bg-gradient-to-r from-light-blue to-blue-800 text-white px-6 py-2.5 rounded-sm font-medium hover:shadow-lg transition inline-flex items-center gap-2"
          >
            Go Home
          </Link>
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminLayout;
