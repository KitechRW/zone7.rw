"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Users, Heart, SidebarOpen, House } from "lucide-react";
import { useProperty } from "@/contexts/PropertyContext";
import Loader from "@/components/misc/Loader";
import logoblue from "../../../public/blue-logo.webp";
import UsersTab from "@/components/adminTab/UsersTab";
import InterestsTab from "@/components/adminTab/InterestsTab";
import PropertiesTab from "@/components/adminTab/PropertyTab";
import { useAuth } from "@/contexts/AuthContext";
import { useInterest } from "@/contexts/InterestContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Avatar from "@/components/misc/Avatar";
import { Variants, motion, AnimatePresence } from "framer-motion";

type AdminTab = "properties" | "users" | "interests";

interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  recentRegistrations: number;
  activeUsers: number;
}

const AdminDashboard = () => {
  const { fetchProperties, fetchStats, stats: PropertyStats } = useProperty();
  const { isAuthenticated, isAdmin, authLoading, user, logout } = useAuth();
  const { stats: interestStats, fetchStats: fetchInterestStats } =
    useInterest();

  const router = useRouter();
  const searchParams = useSearchParams();

  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("properties");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [usersStats, setUsersStats] = useState<UserStats>({
    totalUsers: 0,
    totalAdmins: 0,
    recentRegistrations: 0,
    activeUsers: 0,
  });

  const login = useCallback(() => {
    router.push("/auth");
  }, [router]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["properties", "users", "interests"].includes(tab)) {
      setActiveTab(tab as AdminTab);
    } else {
      setActiveTab("properties");

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("tab", "properties");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams]);

  const changeTab = useCallback((tab: AdminTab) => {
    setActiveTab(tab);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("tab", tab);
    window.history.pushState({}, "", newUrl.toString());
  }, []);

  // Initialize data
  useEffect(() => {
    if (!isAuthenticated || !isAdmin || authLoading) return;

    const initializeData = async () => {
      try {
        await Promise.all([
          fetchProperties({}, 1, 10),
          fetchStats(),
          fetchInterestStats(),
        ]);

        // Fetch user statistics
        const usersResponse = await fetch("/api/users/stats");
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsersStats(usersData.data);
        }
      } catch (error) {
        console.error("Failed to initialize dashboard data:", error);
      } finally {
        setTimeout(() => setPageLoading(false), 1000);
      }
    };

    initializeData();
  }, [
    fetchProperties,
    fetchStats,
    fetchInterestStats,
    isAuthenticated,
    isAdmin,
    authLoading,
  ]);

  const sidebarVariants: Variants = useMemo(
    () => ({
      collapsed: {
        width: "5rem",
      },
      expanded: {
        width: "16rem",
      },
    }),
    []
  );

  const textVariants: Variants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        width: 0,
      },
      visible: {
        opacity: 1,
        width: "auto",
      },
    }),
    []
  );

  const Sidebar = useMemo(
    () => (
      <motion.aside
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed xl:sticky h-screen top-0 left-0 bg-white/70 backdrop-blur-md shadow-sm z-50 overflow-hidden"
      >
        <div className="relative h-full px-7 py-10">
          <div className="mb-10">
            <Link href="/">
              <Image src={logoblue} alt="Logo" className="w-16" priority />
            </Link>
          </div>

          <div className="absolute top-24 flex items-center gap-3 mb-14">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex-shrink-0 w-6 h-6 text-gray-600 cursor-pointer transition-transform duration-200"
              style={{
                transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)",
              }}
            >
              <SidebarOpen className="w-6 h-6" />
            </button>

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.h3
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={textVariants}
                  transition={{ duration: 0.2 }}
                  className="bg-neutral-800 bg-clip-text text-transparent text-lg font-semibold whitespace-nowrap overflow-hidden"
                >
                  Admin Dashboard
                </motion.h3>
              )}
            </AnimatePresence>
          </div>

          <nav className="absolute top-44 space-y-5">
            <button
              title="Properties"
              onClick={() => changeTab("properties")}
              className={`w-full flex items-center gap-3 rounded-sm text-left transition-colors cursor-pointer ${
                activeTab === "properties"
                  ? "text-light-blue"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <House className="w-6 h-6 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={textVariants}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
                  >
                    <span>Properties</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button
              title="Interests"
              onClick={() => changeTab("interests")}
              className={`w-full flex items-center gap-3 rounded-sm text-left transition-colors cursor-pointer ${
                activeTab === "interests"
                  ? "text-light-blue"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Heart className="w-6 h-6 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={textVariants}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
                  >
                    <span>Interests</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button
              title="Users"
              onClick={() => changeTab("users")}
              className={`w-full flex items-center gap-3 rounded-sm text-left transition-colors cursor-pointer ${
                activeTab === "users"
                  ? "text-light-blue"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Users className="w-6 h-6 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={textVariants}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
                  >
                    <span>Users</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </nav>

          <div className="absolute left-7 bottom-10 right-7">
            {user ? (
              isCollapsed ? (
                <Avatar userName={user.username} />
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-4 mb-5">
                    <Avatar userName={user.username} />
                    <div className="flex-1 min-w-0">
                      <h1 className="font-semibold text-gray-900 text-sm capitalize">
                        {user?.username?.split("_")[0] || "User"}
                      </h1>
                      <p className="text-gray-500 text-xs truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="px-2 pt-2 pb-3 font-medium text-sm text-white bg-black rounded transition cursor-pointer"
                  >
                    {authLoading ? (
                      <div className="w-5 h-5 mx-auto border-2 border-white rounded-full border-t-transparent animate-spin" />
                    ) : (
                      "Logout"
                    )}
                  </button>
                </div>
              )
            ) : (
              <button
                onClick={login}
                className="w-full bg-gradient-to-r from-light-blue to-blue-800 font-medium text-white px-4 pb-3 pt-2 rounded-sm hover:shadow-lg transition cursor-pointer"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    ),
    [
      isCollapsed,
      activeTab,
      user,
      authLoading,
      PropertyStats?.totalProperties,
      interestStats?.total,
      usersStats.activeUsers,
      sidebarVariants,
      textVariants,
      changeTab,
      logout,
      login,
    ]
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "properties":
        return <PropertiesTab />;
      case "users":
        return (
          <UsersTab
            onViewUserInterests={(userId: string, userName: string) => {
              setSelectedUserId(userId);
              setSelectedUserName(userName);
              changeTab("interests");
            }}
          />
        );
      case "interests":
        return (
          <InterestsTab
            filterByUserId={selectedUserId}
            filterByUserName={selectedUserName}
            onClearUserFilter={() => {
              setSelectedUserId(null);
              setSelectedUserName("");
            }}
          />
        );
      default:
        return <PropertiesTab />;
    }
  };

  if (authLoading || pageLoading) {
    return <Loader className="h-screen" />;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-platinum">
      <div className="flex">
        <div
          className="flex-shrink-0 transition-all duration-200 hidden xl:block"
          style={{ width: isCollapsed ? "5rem" : "16rem" }}
        >
          {Sidebar}
        </div>

        <div className="xl:hidden">{Sidebar}</div>

        <div className="flex-1 min-w-0 px-5 py-10 xs:ml-16 xl:ml-0">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
