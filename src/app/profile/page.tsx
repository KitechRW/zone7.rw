"use client";

import Avatar from "@/components/misc/Avatar";
import { useAuth } from "../../contexts/AuthContext";

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          </div>

          <div className="px-6 py-4">
            {user && (
              <div className=" relative flex items-center space-x-4 mb-6">
                <div>
                  <div className=" scale-200 py-5 ml-16">
                    <Avatar userName={user?.email} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 capitalize">
                    {user?.username.split("_")[0]}
                  </h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    Signed in via {user?.provider}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  Account Information
                </h3>
                <p className="text-sm text-gray-600">
                  Manage your account settings and preferences.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  Property Preferences
                </h3>
                <p className="text-sm text-gray-600">
                  Set your property search preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
