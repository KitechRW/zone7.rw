"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import logo from "../../../public/blue-logo.webp";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import Loader from "../misc/Loader";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, SetPageLoading] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setTimeout(() => {
      SetPageLoading(false);
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
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
          formData.password
        )
      ) {
        errors.password =
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
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
    if (!validateFields()) return;

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
          // Auto-login after successful registration
          setTimeout(async () => {
            const result = await signIn("credentials", {
              email: formData.email,
              password: formData.password,
              redirect: false,
            });

            if (result?.ok) {
              await getSession();
              router.push("/");
            } else {
              setLoginState("login");
              setError("Registration successful! Please sign in.");
            }
          }, 2000);
        } else {
          if (data.errors && Array.isArray(data.errors)) {
            setError(data.errors);
          } else if (data.details && Array.isArray(data.details)) {
            setError(
              data.details.map(
                (detail: { message: string }) => detail.message || detail
              )
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
          await getSession();
          router.push("/");
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setError(
        (error instanceof Error && error.message) || "Google sign in failed"
      );
    }
  };

  const minLentgh = formData.password.length >= 8;
  const hasUppercase = /(?=.*[A-Z])/.test(formData.password);
  const hasLowercase = /(?=.*[a-z])/.test(formData.password);
  const hasNumber = /(?=.*\d)/.test(formData.password);
  const hasSpecialChar = /[@$!%*?&]/.test(formData.password);

  const allValid =
    minLentgh && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

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
              hasSpecialChar ? "bg-green-500" : "bg-gray-300"
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

  return pageLoading ? (
    <Loader className="h-screen" />
  ) : (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/dx2czuzzs/image/upload/v1757017159/20230301_133532_bra5eb.jpg"
            alt="Background Image"
            fill
            className="object-cover"
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
                <Image src={logo} alt="Logo" width={100} height={100} />
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
            {loginState === "login" ? (
              <></>
            ) : (
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-light-blue border-gray-300 rounded focus:ring-light-blue cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              {loginState === "login" && error && (
                <p className="text-sm text-light-blue hover:text-blue-800 transition-colors cursor-pointer">
                  Forgot password?
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-light-blue to-blue-800 text-white py-4 rounded-sm font-medium  transition-all duration-300 transform cursor-pointer"
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
                    setLoginState("register");
                    setFieldErrors({});
                    clearError();
                    clearFormData();
                  }}
                  className="text-light-blue hover:text-blue-800 font-medium transition-colors cursor-pointer"
                >
                  Create one now
                </span>
              </p>
            ) : (
              <p className="text-gray-600">
                Already have an account?{" "}
                <span
                  onClick={() => {
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={googleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center p-4 border-2 border-gray-300 rounded-sm hover:bg-gray-200/60 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285f4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34a853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fbbc05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ea4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="ml-2 font-medium text-gray-700">Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
