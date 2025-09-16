"use client";

import { useEffect, useState } from "react";
import { Home, Users, Heart, SidebarOpen } from "lucide-react";
import { useProperty } from "@/contexts/PropertyContext";
import Header2 from "@/components/layout/Header2";
import Loader from "@/components/misc/Loader";
import UsersTab from "@/components/adminTab/UsersTab";
import InterestsTab from "@/components/adminTab/InterestsTab";
import PropertiesTab from "@/components/adminTab/PropertyTab";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

type AdminTab = "properties" | "users" | "interests";

const mockInterestsCount = 12;

const AdminDashboard = () => {
  const { fetchProperties, fetchStats, stats } = useProperty();
  const { isAuthenticated, isAdmin, authLoading } = useAuth();

  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("properties");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [usersStats, setUsersStats] = useState({ total: 0, admins: 0 });

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!isAdmin) {
      router.push("/unauthorized");
      return;
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // Initialize data
  useEffect(() => {
    if (!isAuthenticated || !isAdmin || authLoading) return;

    const initializeData = async () => {
      try {
        await Promise.all([fetchProperties({}, 1, 10), fetchStats()]);

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
  }, [fetchProperties, fetchStats, isAuthenticated, isAdmin, authLoading]);

  const Sidebar = () => (
    <div
      className={`fixed top-20 left-0 ${
        isCollapsed ? "w-16" : "w-72"
      } bg-white/50 backdrop-blur-xl shadow-sm h-full transition-all duration-300 truncate z-50`}
    >
      <div className="px-5 py-10">
        <div className="flex items-center gap-3 mb-10">
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

        <nav className="my-5 space-y-5">
          <button
            title="Properties"
            onClick={() => {
              setActiveTab("properties");
            }}
            className={`w-full flex items-center gap-3 rounded-lg text-left transition-colors cursor-pointer ${
              activeTab === "properties"
                ? "text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className={`${isCollapsed ? "hidden" : ""}`}>Properties</span>
            <span
              className={`${
                isCollapsed ? "hidden" : ""
              } bg-gray-200/80 text-gray-700 px-2 py-1 rounded-full text-[10px]`}
            >
              {stats?.totalProperties || 0}
            </span>
          </button>

          <button
            title="Users"
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 rounded-lg text-left transition-colors cursor-pointer ${
              activeTab === "users"
                ? "text-blue-700"
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
              } bg-gray-200/80 text-gray-700 px-2 py-1 rounded-full text-[10px]`}
            >
              {usersStats.total || 0}
            </span>
          </button>

          <button
            title="Interests"
            onClick={() => {
              setActiveTab("interests");
            }}
            className={`w-full flex items-center gap-3 rounded-lg text-left transition-colors cursor-pointer ${
              activeTab === "interests"
                ? "text-blue-700"
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
              } bg-gray-200/80 text-gray-700 px-2 py-1 rounded-full text-[10px]`}
            >
              {mockInterestsCount}
            </span>
          </button>
        </nav>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "properties":
        return <PropertiesTab />;
      case "users":
        return <UsersTab />;
      case "interests":
        return <InterestsTab />;
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
      <Header2 />
      <div className="flex max-w-7xl mx-auto px-5 my-20">
        <div className="xs:min-w-16 lg:min-w-0">
          <Sidebar />
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative w-full">
            <div className="mb-8">
              <h2 className="text-center text-2xl mt-6 font-bold">
                <span className="bg-blue-900 bg-clip-text text-transparent capitalize">
                  {activeTab}
                </span>
              </h2>
            </div>

            <div className="w-full">{renderActiveTab()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
