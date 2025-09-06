"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import logo from "../../../public/blue-logo.webp";
import Link from "next/link";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loginState, setLoginState] = useState<"login" | "register">("login");

  return (
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
        <div className="max-w-md w-full">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Image src={logo} alt="Logo" width={150} height={100} />
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

          <div className="space-y-6">
            {loginState === "login" ? (
              <></>
            ) : (
              <div className="relative">
                <div
                  className={`relative border-2 rounded-lg transition-all duration-300 ${
                    usernameFocused || username
                      ? "border-light-blue"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setUsernameFocused(true)}
                    onBlur={() => setUsernameFocused(false)}
                    className="w-full pl-12 pr-4 py-4 bg-transparent outline-none text-gray-900 placeholder-transparent"
                    placeholder="Enter your email"
                    required
                  />
                  <label
                    className={`absolute left-5 transition-all duration-300 pointer-events-none ${
                      usernameFocused || username
                        ? "top-0 -translate-y-1/2 text-xs bg-white px-2 text-light-blue font-medium"
                        : "top-1/2 -translate-y-1/2 text-gray-500"
                    }`}
                  >
                    Username
                  </label>
                </div>
              </div>
            )}

            <div className="relative">
              <div
                className={`relative border-2 rounded-lg transition-all duration-300 ${
                  emailFocused || email
                    ? "border-light-blue"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="w-full pl-12 pr-4 py-4 bg-transparent outline-none text-gray-900 placeholder-transparent"
                  placeholder="Enter your email"
                  required
                />
                <label
                  className={`absolute left-5 transition-all duration-300 pointer-events-none ${
                    emailFocused || email
                      ? "top-0 -translate-y-1/2 text-xs bg-white px-2 text-light-blue font-medium"
                      : "top-1/2 -translate-y-1/2 text-gray-500"
                  }`}
                >
                  Email Address
                </label>
              </div>
            </div>

            <div className="relative">
              <div
                className={`relative border-2 rounded-lg transition-all duration-300 ${
                  passwordFocused || password
                    ? "border-light-blue"
                    : "border-gray-200"
                }`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="w-full pl-12 pr-12 py-4 bg-transparent outline-none text-gray-900 placeholder-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                <label
                  className={`absolute left-5 transition-all duration-300 pointer-events-none ${
                    passwordFocused || password
                      ? "top-0 -translate-y-1/2 text-xs bg-white px-2 text-light-blue font-medium"
                      : "top-1/2 -translate-y-1/2 text-gray-500"
                  }`}
                >
                  Password
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-light-blue border-gray-300 rounded focus:ring-light-blue cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              {loginState === "register" ? (
                <></>
              ) : (
                <p className="text-sm text-light-blue hover:text-blue-800 transition-colors cursor-pointer">
                  Forgot password?
                </p>
              )}
            </div>

            <button
              type="button"
              className="w-full bg-gradient-to-r from-light-blue to-blue-800 text-white py-4 rounded-sm font-medium  transition-all duration-300 transform cursor-pointer"
            >
              {loginState === "login" ? "Log In" : "Register"}
            </button>

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
              className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-200/60 transition-colors cursor-pointer"
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
              <span className="ml-2 text-sm font-medium text-gray-700">
                Google
              </span>
            </button>

            <div className="text-center">
              {loginState === "login" ? (
                <p className="text-gray-600">
                  Don&#39;t have an account?{" "}
                  <span
                    onClick={() => setLoginState("register")}
                    className="text-light-blue hover:text-blue-800 font-medium transition-colors cursor-pointer"
                  >
                    Create one now
                  </span>
                </p>
              ) : (
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <span
                    onClick={() => setLoginState("login")}
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
    </div>
  );
};

export default LoginPage;
