"use client";

import React, { ChangeEvent, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logoblue from "../../../../public/blue-logo.webp";

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const manageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear general error
    if (generalError) {
      setGeneralError("");
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setGeneralError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
      } else {
        setGeneralError(
          data.message || "Something went wrong. Please try again."
        );
      }
    } catch (error) {
      setGeneralError(
        "Network error. Please check your connection and try again."
      );
      console.error("Forgot password error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                If an account with <strong>{formData.email}</strong> exists, you
                will receive a password reset link shortly.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Didn&#39;t receive the email?</p>
                    <p className="mt-1">
                      Check your spam folder, or contact support if you continue
                      having issues.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ email: "" });
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to reset form
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/">
            <Image
              src={logoblue}
              alt="Logo"
              className="w-20 justify-self-center py-2"
              priority
            />
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and a link to reset your password will be
            sent to you.
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {generalError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                  <div className="text-sm text-red-800">
                    <p>{generalError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                autoComplete="email"
                onChange={manageInputChange}
                className={`peer w-full px-5 py-4 text-black rounded-sm border-2 ${
                  fieldErrors.email
                    ? "border-red-500"
                    : "border-black/50 focus:border-light-blue"
                } outline-none transition-all duration-300`}
                placeholder=""
                required
                disabled={loading}
              />
              <label
                htmlFor="email"
                className="absolute bg-white px-1 text-xs text-gray-500 transition-all left-4 -top-[9px] peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-600 peer-focus:-top-[9px] peer-focus:text-xs peer-focus:text-light-blue cursor-text"
              >
                Email Address
              </label>
              {fieldErrors.email && (
                <div className="flex items-center gap-1 py-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-xs text-red-600">{fieldErrors.email}</p>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 rounded-sm text-sm font-medium text-white bg-gradient-to-r from-light-blue to-blue-800 hover:shadow-lg  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Sending reset link...
                  </>
                ) : (
                  "Send reset link"
                )}
              </button>
            </div>

            <div className="text-center text-gray-500 text-sm">
              <Link href="/auth/">
                Remember your password?{" "}
                <span className="text-sm text-light-blue hover:text-blue-500 transition-colors duration-200">
                  Sign in
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
