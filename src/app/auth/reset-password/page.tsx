"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { AlertCircle, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import logoblue from "../../../../public/blue-logo.webp";
import Loader from "@/components/misc/Loader";
import Link from "next/link";
import Image from "next/image";

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [token, setToken] = useState("");
  const [tokenValidation, setTokenValidation] = useState({
    isValid: false,
    email: "",
    loading: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get("token");
      if (tokenParam) {
        setToken(tokenParam);
        validateToken(tokenParam);
      } else {
        setTokenValidation({ isValid: false, email: "", loading: false });
        setGeneralError(
          "Invalid reset link. Please request a new password reset."
        );
      }
    }
  }, []);

  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch(
        `/api/auth/validate-reset-token?token=${tokenToValidate}`
      );
      const data = await response.json();

      if (response.ok && data.success && data.data.isValid) {
        setTokenValidation({
          isValid: true,
          email: data.data.email || "",
          loading: false,
        });
      } else {
        setTokenValidation({ isValid: false, email: "", loading: false });
        setGeneralError(
          "This reset link has expired or is invalid. Please request a new password reset."
        );
      }
    } catch {
      setTokenValidation({ isValid: false, email: "", loading: false });
      setGeneralError("Unable to validate reset link. Please try again.");
    }
  };

  const manageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (generalError) {
      setGeneralError("");
    }
  };

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("at least 8 characters");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("one lowercase letter");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("one uppercase letter");
    }
    if (!/\d/.test(password)) {
      errors.push("one number");
    }
    return errors;
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.newPassword) {
      errors.newPassword = "Password is required";
    } else {
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        errors.newPassword = `Password must contain ${passwordErrors.join(
          ", "
        )}`;
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
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
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
      } else {
        // Check if it's a token validation error
        if (
          data.message &&
          (data.message.includes("Invalid or expired reset token") ||
            data.message.includes("expired"))
        ) {
          // Update token validation state to show the invalid token UI
          setTokenValidation({ isValid: false, email: "", loading: false });
        } else {
          setGeneralError(
            data.message || "Failed to reset password. Please try again."
          );
        }
      }
    } catch (error) {
      setGeneralError(
        "Network error. Please check your connection and try again."
      );
      console.error("Reset password error:", error);
    } finally {
      setLoading(false);
    }
  };

  const minLentgh = formData.newPassword.length >= 8;
  const hasUppercase = /(?=.*[A-Z])/.test(formData.newPassword);
  const hasLowercase = /(?=.*[a-z])/.test(formData.newPassword);
  const hasNumber = /(?=.*\d)/.test(formData.newPassword);

  const allValid = minLentgh && hasUppercase && hasLowercase && hasNumber;
  const passwordStrength =
    formData.newPassword.length > 0 ? (
      <div>
        <div className="flex space-x-1">
          <div
            className={`h-1 w-1/4 rounded ${
              minLentgh ? "bg-green-500" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`h-1 w-1/4 rounded ${
              hasUppercase ? "bg-green-500" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`h-1 w-1/4 rounded ${
              hasLowercase ? "bg-green-500" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`h-1 w-1/4 rounded ${
              hasNumber ? "bg-green-500" : "bg-gray-300"
            }`}
          ></div>
        </div>
        <p className="mt-1 text-xs text-gray-600">
          {!allValid &&
            "Must contain: 8+ Characters, Uppercase, Lowercase, Special character and Number"}
        </p>
      </div>
    ) : null;

  if (tokenValidation.loading) {
    return <Loader className="h-screen" />;
  }

  if (!tokenValidation.isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Reset Link
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                This password reset link has expired or is invalid.
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center px-8 py-3 text-sm font-medium rounded-sm text-white bg-gradient-to-r from-light-blue to-blue-800 hover:shadow-lg transition-colors duration-200"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-700">
                Password Reset Successful
              </h2>
              <p className="text-sm text-gray-600 my-5">
                Your password has been successfully reset. You can now sign in
                with your new password.
              </p>
              <Link
                href="/auth"
                className="inline-flex items-center px-8 py-2.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-light-blue to-blue-800 hover:shadow-lg transition-colors duration-200"
              >
                Sign In
              </Link>
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
          <h2 className="text-3xl font-bold text-gray-700">
            Reset your password
          </h2>
          <p className="mt-4 text-sm text-gray-500">
            {tokenValidation.email && (
              <>
                Resetting password for <strong>{tokenValidation.email}</strong>
              </>
            )}
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
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={manageInputChange}
                className={`peer w-full px-5 py-4 text-black rounded-sm border-2 ${
                  fieldErrors.newPassword
                    ? "border-red-500"
                    : "border-neutral-400 focus:border-light-blue"
                } outline-none transition-all duration-300 pr-12`}
                placeholder=""
                required
                disabled={loading}
              />
              <label
                htmlFor="newPassword"
                className="absolute bg-white px-1 text-xs text-gray-500 transition-all left-4 -top-[9px] peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-neutral-400 peer-focus:-top-[9px] peer-focus:text-xs peer-focus:text-light-blue cursor-text"
              >
                New Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-5 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {fieldErrors.newPassword && (
                <div className="flex items-center gap-1 py-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-xs text-red-600">
                    {fieldErrors.newPassword}
                  </p>
                </div>
              )}
            </div>

            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={manageInputChange}
                className={`peer w-full px-5 py-4 text-black rounded-sm border-2 ${
                  fieldErrors.confirmPassword
                    ? "border-red-500"
                    : "border-neutral-400 focus:border-light-blue"
                } outline-none transition-all duration-300 pr-12`}
                placeholder=""
                required
                disabled={loading}
              />
              <label
                htmlFor="confirmPassword"
                className="absolute bg-white px-1 text-xs text-gray-500 transition-all left-4 -top-[9px] peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-neutral-400 peer-focus:-top-[9px] peer-focus:text-xs peer-focus:text-light-blue cursor-text"
              >
                Confirm New Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-5 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {fieldErrors.confirmPassword && (
                <div className="flex items-center gap-1 py-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-xs text-red-600">
                    {fieldErrors.confirmPassword}
                  </p>
                </div>
              )}
            </div>

            {passwordStrength}

            <div>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-light-blue to-blue-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Resetting password...
                  </>
                ) : (
                  <>Reset password</>
                )}
              </button>
            </div>

            <div className="text-center">
              <Link href="/auth">
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

export default ResetPasswordPage;
