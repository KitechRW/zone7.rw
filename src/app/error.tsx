"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home } from "lucide-react";

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  if (error.message.includes("404") || error.message.includes("not found")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">Page not found</p>
          <Link
            href="/"
            className="bg-gradient-to-r from-light-blue to-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition inline-flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-platinum">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-8">{error.message}</p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="bg-gradient-to-r from-light-blue to-blue-800 text-white font-medium px-4 py-3 rounded-sm hover:shadow-lg transition inline-flex items-center gap-2 cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-gray-400 text-black px-4 py-3 rounded-sm hover:bg-gray-200 transition inline-flex items-center gap-2"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error;
