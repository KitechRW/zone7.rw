"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import logo from "../../../public/blue-logo.webp";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import Loader from "../misc/Loader";
import { UserRole } from "@/lib/utils/permission";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setTimeout(() => {
      setPageLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "login") {
      setLoginState("login");
    } else if (mode === "register") {
      setLoginState("register");
    }
  }, [searchParams]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", loginState);
    window.history.replaceState({}, "", url.toString());
  }, [loginState]);

  const manageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (fieldErrors[id]) {
      setFieldErrors((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
  };

  const clearFormData = () => {
    setFormData({ email: "", password: "", username: "" });
  };

  const clearError = () => setError("");

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};

    if (loginState === "register") {
      if (!formData.username) {
        errors.userName = "Username is required";
      } else if (formData.username.length > 50) {
        errors.userName = "Username must be less than 50 characters";
      } else if (formData.username.length < 3) {
        errors.userName = "Username must be at least 3 characters";
      }
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
    ) {
      errors.email = "Please enter a valid email address";
    }

    if (loginState === "register") {
      if (!formData.password) {
        errors.password = "Password is required";
      } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]/.test(formData.password)
      ) {
        errors.password =
          "Password must contain at least one uppercase letter, one lowercase letter, and one number.";
      }
    }

    if (loginState === "login") {
      if (!formData.password) {
        errors.password = "Password is required";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    if (!validateFields()) {
      setLoading(false);
      return;
    }

    try {
      if (loginState === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setRedirecting(true);

          // Auto-login after successful registration
          const result = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });

          if (result?.ok) {
            const session = await getSession();

            if (
              session?.user.role === UserRole.OWNER ||
              session?.user.role === UserRole.ADMIN
            ) {
              router.push("/admin");
            } else {
              router.push("/");
            }
          } else {
            setRedirecting(false);
            setLoginState("login");
            setError("Registration successful! Please sign in.");
          }
        } else {
          if (data.errors && Array.isArray(data.errors)) {
            setError(data.errors.join(", "));
          } else if (data.details && Array.isArray(data.details)) {
            setError(
              data.details
                .map((detail: { message: string }) => detail.message || detail)
                .join(", ")
            );
          } else {
            setError(data.message || "Registration failed");
          }
        }
      } else {
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid email or password");
        } else {
          setRedirecting(true);

          const session = await getSession();
          if (
            session?.user.role === UserRole.OWNER ||
            session?.user.role === UserRole.ADMIN
          ) {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const minLentgh = formData.password.length >= 8;
  const hasUppercase = /(?=.*[A-Z])/.test(formData.password);
  const hasLowercase = /(?=.*[a-z])/.test(formData.password);
  const hasNumber = /(?=.*\d)/.test(formData.password);

  const allValid = minLentgh && hasUppercase && hasLowercase && hasNumber;

  const passwordStrength =
    formData.password.length > 0 && loginState === "register" ? (
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

  if (redirecting) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="h-12 w-12 justify-self-center mb-4" />
        </div>
      </div>
    );
  }

  if (pageLoading) {
    return <Loader className="h-screen" />;
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/dx2czuzzs/image/upload/v1757017159/20230301_133532_bra5eb.jpg"
            alt="Background Image"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative max-w-[650px] z-10 flex flex-col justify-center p-12 text-white gap-5">
          <h1 className="text-5xl font-bold">Find Your Dream Home</h1>
          <p className="text-xl text-white/90 leading-relaxed">
            Your journey to homeownership starts here.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[40%] flex items-center justify-center px-10 py-5 bg-white">
        <div className="max-w-md w-full space-y-5">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Image
                  src={logo}
                  alt="Logo"
                  width={100}
                  height={100}
                  priority
                />
              </Link>
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome {loginState === "login" ? "Back" : ""}
            </h3>
            <p className="text-gray-600">
              {loginState === "login" ? "Sign in" : "Sign up"} to place your
              interest
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {loginState === "register" && (
              <div className="relative">
                <div>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={manageInputChange}
                    className={`peer w-full px-5 py-4 text-black rounded-sm border-2 border-gray-400 focus:border-light-blue outline-none autofill:bg-black autofill:text-black ${
                      fieldErrors.userName
                        ? "border-red-500"
                        : "border-black/50"
                    } transition-all duration-300`}
                    placeholder=""
                    required
                    disabled={loading}
                  />
                  <label
                    htmlFor="username"
                    className="absolute bg-white px-1 text-xs text-gray-500 transition-all left-4 -top-[9px] peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-600 peer-focus:-top-[9px] peer-focus:text-xs peer-focus:text-blue-600 cursor-text"
                  >
                    Username
                  </label>
                  {fieldErrors.userName && (
                    <div className="flex items-center gap-1 py-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <p className="text-xs text-red-600">
                        {fieldErrors.userName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="relative">
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  autoComplete="email"
                  onChange={manageInputChange}
                  className={`peer w-full px-5 py-4 text-black rounded-sm border-2 border-gray-400 focus:border-light-blue outline-none autofill:bg-black autofill:text-black ${
                    fieldErrors.email ? "border-red-500" : "border-black/50"
                  } transition-all duration-300`}
                  placeholder=""
                  required
                  disabled={loading}
                />
                <label
                  htmlFor="email"
                  className="absolute bg-white px-1 text-xs text-gray-500 transition-all left-4 -top-[9px] peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-600 peer-focus:-top-[9px] peer-focus:text-xs peer-focus:text-blue-600 cursor-text"
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
            </div>

            <div className="relative">
              <div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={manageInputChange}
                  className={`peer w-full px-5 py-4 text-black rounded-sm border-2 border-gray-400 focus:border-light-blue outline-none autofill:bg-black autofill:text-black ${
                    fieldErrors.password ? "border-red-500" : "border-black/50"
                  } transition-all duration-300`}
                  placeholder=""
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                <label
                  htmlFor="password"
                  className="absolute bg-white px-1 text-xs text-gray-500 transition-all left-4 -top-[9px] peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-600 peer-focus:-top-[9px] peer-focus:text-xs peer-focus:text-blue-600 cursor-text"
                >
                  Password
                </label>
              </div>
            </div>
            {passwordStrength}
            {fieldErrors.password && (
              <div className="flex items-center gap-1 py-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-xs text-red-600">{fieldErrors.password}</p>
              </div>
            )}

            {error && (
              <div className="flex items-center self-center gap-1 mb-6 font-medium">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="w-full text-sm text-red-500 rounded-md">
                  {error === "Invalid credentials"
                    ? "Invalid email or password. Please try again."
                    : error}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              {loginState === "login" && (
                <Link href="/auth/forgot-password">
                  <p className="text-sm text-light-blue hover:text-blue-800 transition-colors cursor-pointer">
                    Forgot password?
                  </p>
                </Link>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-sm font-medium transition-all duration-300 transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-t-transparent border-l-transparent border-white justify-self-center rounded-full animate-spin"></div>
              ) : loginState === "login" ? (
                "Log In"
              ) : (
                "Register"
              )}
            </button>
          </form>

          <div className="text-center">
            {loginState === "login" ? (
              <p className="text-gray-600">
                Don&#39;t have an account?{" "}
                <span
                  onClick={() => {
                    if (loading) return;
                    setLoginState("register");
                    setFieldErrors({});
                    clearError();
                    clearFormData();
                  }}
                  className="text-light-blue hover:text-blue-800 font-medium transition-colors cursor-pointer"
                >
                  Create one here
                </span>
              </p>
            ) : (
              <p className="text-gray-600">
                Already have an account?{" "}
                <span
                  onClick={() => {
                    if (loading) return;
                    setLoginState("login");
                    setFieldErrors({});
                    clearError();
                    clearFormData();
                  }}
                  className="text-light-blue hover:text-blue-800 font-medium transition-colors cursor-pointer"
                >
                  Log in here
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
