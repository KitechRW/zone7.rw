"use client";

import { useEffect, useState } from "react";
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

  const login = () => {
    router.push("/auth");
  };

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

  const changeTab = (tab: AdminTab) => {
    setActiveTab(tab);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("tab", tab);
    window.history.pushState({}, "", newUrl.toString());
  };

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

  const Sidebar = () => (
    <div
      className={`fixed top-0 left-0 ${
        isCollapsed ? "w-20" : "w-72"
      } bg-white/50 backdrop-blur-xl shadow-sm h-full transition-all duration-300 truncate z-50`}
    >
      <div className="relative px-6 py-10">
        <div className="">
          <Link href="/">
            <Image src={logoblue} alt="Logo" className="w-16" priority />
          </Link>
        </div>
        <div className="absolute top-20 left-7 flex items-center gap-3 mt-5 mb-10">
          <SidebarOpen
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`w-6 h-6 text-gray-600 cursor-pointer ${
              isCollapsed ? "" : "rotate-180"
            }`}
          />

          <h3
            className={`${
              isCollapsed ? "hidden" : ""
            } bg-neutral-800 bg-clip-text text-transparent text-xl font-bold`}
          >
            Admin Dashboard
          </h3>
        </div>

        <nav className="absolute top-40 my-5 left-7 space-y-7">
          <button
            title="Properties"
            onClick={() => changeTab("properties")}
            className={`relative w-full flex items-center gap-3 rounded-lg text-left transition-colors cursor-pointer ${
              activeTab === "properties"
                ? "text-light-blue"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <House className="w-6 h-6" />
            <span className={`${isCollapsed ? "hidden" : ""}`}>Properties</span>
            <span
              className={`${
                isCollapsed ? "hidden" : ""
              } absolute -right-5 bg-gray-100 text-gray-900 px-2 py-1 rounded-full text-[10px]`}
            >
              {PropertyStats?.totalProperties || 0}
            </span>
          </button>

          <button
            title="Interests"
            onClick={() => changeTab("interests")}
            className={`w-full flex items-center gap-3 rounded-lg text-left transition-colors cursor-pointer ${
              activeTab === "interests"
                ? "text-light-blue"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Heart className="w-6 h-6" />
            <span className={`${isCollapsed ? "hidden" : "inline-block"}`}>
              Interests
            </span>
            <span
              className={`${
                isCollapsed ? "hidden" : ""
              } bg-gray-100 text-gray-900 px-2 py-1 rounded-full text-[10px]`}
            >
              {interestStats?.total || 0}
            </span>
          </button>

          <button
            title="Users"
            onClick={() => changeTab("users")}
            className={`w-full flex items-center gap-3 rounded-lg text-left transition-colors cursor-pointer ${
              activeTab === "users"
                ? "text-light-blue"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="w-6 h-6" />
            <span className={`${isCollapsed ? "hidden" : "inline-block"}`}>
              Users
            </span>
            <span
              className={`${
                isCollapsed ? "hidden" : ""
              } bg-gray-100 text-gray-900 px-2 py-1 rounded-full text-[10px]`}
            >
              {usersStats.totalUsers + usersStats.totalAdmins || 0}
            </span>
          </button>
        </nav>
      </div>
      <div className="absolute left-7 bottom-10 w-3/4 mx-auto">
        {user ? (
          isCollapsed ? (
            <Avatar userName={user.email} />
          ) : (
            <div className="flex flex-col gap-1">
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
              <button
                onClick={logout}
                className="px-2 pt-2 pb-3 font-medium text-sm text-white bg-black rounded transition cursor-pointer"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent border-b-transparent border-l-transparent animate-spin truncate" />
                ) : (
                  "Logout"
                )}
              </button>
            </div>
          )
        ) : (
          <button
            onClick={login}
            className="bg-gradient-to-r from-light-blue to-blue-800 font-medium text-white px-4 pb-3 pt-2 rounded-sm hover:shadow-lg transition cursor-pointer"
          >
            Login
          </button>
        )}
      </div>
    </div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex max-w-7xl mx-auto px-5 my-5">
        <div className="xs:min-w-16 lg:min-w-0">
          <Sidebar />
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative w-full">
            <div className="mb-10"></div>

            <div className="w-full">{renderActiveTab()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
