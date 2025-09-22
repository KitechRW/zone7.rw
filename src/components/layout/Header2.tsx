"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import logoblue from "../../../public/blue-logo.webp";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Avatar from "../misc/Avatar";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  const login = () => {
    router.push("/auth");
  };

  const menuItemClick = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  const menuVariants: Variants = {
    hidden: {
      x: "100%",
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "tween",
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: {
        type: "tween",
        duration: 0.25,
        ease: "easeInOut",
      },
    },
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="bg-white/85 backdrop-blur-md shadow-md">
        <div className="relative max-w-7xl mx-auto flex items-center justify-between xs:px-10 lg:px-5 py-1 h-20">
          <div>
            <Link href="/">
              <Image
                src={logoblue}
                alt="Logo"
                className="xs:w-20 md:w-24"
                priority
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/">
              <h2 className="text-black font-medium hover:text-cyan-700 transition cursor-pointer">
                Home
              </h2>
            </Link>

            <Link href="/properties">
              <h2 className="text-black font-medium hover:text-cyan-700 transition cursor-pointer">
                Properties
              </h2>
            </Link>

            {user ? (
              <div className="group">
                <button className="flex items-center justify-center overflow-hidden rounded-full xs:w-0 md:w-8">
                  <Avatar userName={user.email} />
                </button>
                <div className="absolute right-5 min-w-48 z-50 items-center hidden px-5 py-5 bg-platinum/90 rounded-md shadow-lg group-hover:block backdrop-blur-sm">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Link href="/profile" title="My account">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <h1 className="font-semibold text-gray-900 text-sm capitalize">
                            {user?.username?.split("_")[0] || "User"}
                          </h1>
                          <p className="text-gray-500 text-xs truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full px-2 pt-1 pb-2 text-sm text-white font-medium bg-black rounded cursor-pointer"
                    >
                      {authLoading ? (
                        <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent border-b-transparent border-l-transparent animate-spin justify-self-center" />
                      ) : (
                        "Logout"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={login}
                className="bg-gradient-to-r from-light-blue to-blue-800 font-medium px-4 pb-2 pt-1 rounded-sm text-white transition cursor-pointer"
              >
                Login
              </button>
            )}
          </nav>
          <button
            className="md:hidden focus:outline-none cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-black" />
            ) : (
              <Menu className="w-6 h-6 text-black" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 md:hidden min-w-[40%] max-w-1/2 p-5 h-screen bg-platinum/80 backdrop-blur-sm shadow-lg rounded-bl-lg"
          >
            <div className="relative h-full py-5">
              <div className="flex flex-col gap-4">
                <Link href="/">
                  <h2 className="text-black font-medium hover:text-cyan-700 transition cursor-pointer">
                    Home
                  </h2>
                </Link>

                <Link href="/properties">
                  <h2 className="text-black font-medium hover:text-cyan-700 transition cursor-pointer">
                    Properties
                  </h2>
                </Link>
              </div>

              <div className="absolute bottom-28 max-w-full">
                {user ? (
                  <div className="flex flex-col gap-1">
                    <Link href="/profile">
                      <div className="flex items-center gap-4 mb-5">
                        {user && <Avatar userName={user?.email} />}
                        <div className="flex-1 min-w-0">
                          <h1 className="font-semibold text-gray-900 text-sm capitalize">
                            {user?.username?.split("_")[0] || "User"}
                          </h1>
                          <p className="text-gray-500 text-xs truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => menuItemClick(logout)}
                      className="px-2 pt-2 pb-3 font-medium text-sm text-white bg-black rounded transition cursor-pointer"
                    >
                      {authLoading ? (
                        <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent border-b-transparent border-l-transparent animate-spin truncate" />
                      ) : (
                        "Logout"
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => menuItemClick(login)}
                    className="w-full bg-gradient-to-r from-light-blue to-blue-800 font-medium text-white px-4 py-2.5 rounded-sm hover:shadow-lg transition cursor-pointer"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
