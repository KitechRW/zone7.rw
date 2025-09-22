"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-platinum px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-3xl font-bold text-black mb-4">Page Not Found</h2>
          <p className="text-gray-600">
            Sorry, we couldn&#39;t find the page you&#39;re looking for. It
            might have been moved or doesn&#39;t exist.
          </p>
        </div>

        <div className="flex flex-col justify-center items-center gap-4">
          <Link
            href="/"
            className="w-full max-w-80 mx-auto bg-gradient-to-r from-light-blue to-blue-800 text-white py-2.5 rounded-sm font-medium hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            Return Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full max-w-80 mx-auto border border-gray-400 text-gray-700 py-2.5 rounded-sm font-medium hover:bg-gray-200 transition cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
