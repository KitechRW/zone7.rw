"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Loader2,
  Eye,
  X,
  Heart,
  Calendar,
  User,
  Phone,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { UserRole } from "@/lib/utils/permission";
import SearchBar from "../misc/SearchBar";

interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  provider: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface UserInterest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userPhone: string;
  message?: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
  updatedAt: string;
}

interface UserDetails extends User {
  interests: UserInterest[];
  totalInterests: number;
}

const ITEMS_PER_PAGE = 10;

const UsersTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"username" | "email" | "createdAt">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/users");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoadingDetails(true);
      setError(null);

      // Fetch user details and their interests in parallel
      const [userResponse, interestsResponse] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/interests?userId=${userId}`), // You might need to adjust this endpoint
      ]);

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.message || "Failed to fetch user details");
      }

      const userData = await userResponse.json();
      let interests: UserInterest[] = [];

      // If interests endpoint exists and responds successfully
      if (interestsResponse.ok) {
        const interestsData = await interestsResponse.json();
        interests = interestsData.data?.interests || [];
      }

      const details: UserDetails = {
        ...userData.data,
        interests,
        totalInterests: interests.length,
      };

      setUserDetails(details);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch user details"
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewUser = (userId: string) => {
    setViewingUser(userId);
    fetchUserDetails(userId);
  };

  const closeModal = () => {
    setViewingUser(null);
    setUserDetails(null);
    setLoadingDetails(false);
  };

  const deleteUser = async (userId: string) => {
    try {
      setUpdatingUser(userId);
      setError(null);

      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      // Remove from local state
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setUpdatingUser(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort users
    filtered.sort((a, b) => {
      let aValue: string | Date = a[sortBy];
      let bValue: string | Date = b[sortBy];

      if (sortBy === "createdAt") {
        aValue = new Date(aValue as string);
        bValue = new Date(bValue as string);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  const handleSort = (column: "username" | "email" | "createdAt") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-white py-10 px-5 shadow-sm">
        <div className="space-y-2">
          <div className="animate-pulse mb-20">
            <div className="flex space-x-4">
              <div className="bg-gray-200 rounded-sm w-full h-16"></div>
            </div>
          </div>
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse">
              <div className="bg-gray-200 rounded-sm w-full h-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-sm p-6">
        <div className="text-red-800 font-medium">Error: {error}</div>
        <button
          onClick={fetchUsers}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-sm shadow-sm p-5 mb-10">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                Sort by:
              </span>
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [column, order] = e.target.value.split("-");
                    setSortBy(column as "username" | "email" | "createdAt");
                    setSortOrder(order as "asc" | "desc");
                  }}
                  className="w-24 py-2.5 px-3  text-left text-gray-500 text-xs bg-white cursor-pointer border border-gray-300 rounded-t-lg hover:border-gray-400 focus:outline-none focus:border-gray-800 transition-all duration-200 flex items-center justify-between"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="username-asc">Username A-Z</option>
                  <option value="username-desc">Username Z-A</option>
                  <option value="email-asc">Email A-Z</option>
                  <option value="email-desc">Email Z-A</option>
                </select>
              </div>
            </div>
          </div>

          {searchQuery && (
            <div className="mt-4 text-sm text-gray-600">
              Found {filteredAndSortedUsers.length} user
              {filteredAndSortedUsers.length !== 1 ? "s" : ""}
              matching &#34;{searchQuery}&#34;
            </div>
          )}
        </div>

        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("username")}
                  >
                    <div className="flex items-center gap-1">
                      User ({filteredAndSortedUsers.length})
                      {sortBy === "username" && (
                        <span className="text-blue-600">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-1">
                      Email
                      {sortBy === "email" && (
                        <span className="text-blue-600">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      Date Joined
                      {sortBy === "createdAt" && (
                        <span className="text-blue-600">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.username
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-500">
                            {user.username}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {user.role} • {user.provider}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
                          onClick={() => handleViewUser(user._id)}
                          title="View user details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 pl-2 transition-colors disabled:opacity-50 cursor-pointer"
                          onClick={() => setDeleteConfirm(user._id)}
                          disabled={updatingUser === user._id}
                        >
                          {updatingUser === user._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {currentUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-500">
                No users found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? `No users match your search "${searchQuery}"`
                  : "No users have registered yet"}
              </p>
            </div>
          )}

          {deleteConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
              <div className="flex flex-col items-center justify-center gap-6 bg-white p-6 text-black w-80 max-w-sm mx-4 rounded-sm">
                <h4 className="text-lg text-center font-bold">Delete User?</h4>
                <p className="text-sm text-gray-600 text-center">
                  This action cannot be undone.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => deleteUser(deleteConfirm)}
                    className="bg-red-600 text-white font-semibold px-4 py-2 rounded-sm hover:bg-red-700 cursor-pointer transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="bg-gray-200 text-black font-semibold px-4 py-2 rounded-sm hover:bg-gray-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredAndSortedUsers.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredAndSortedUsers.length}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-sm shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === index + 1
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {viewingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-500 flex items-center">
                User Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-red-700 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto">
              {loadingDetails ? (
                <div className="p-6 text-center">
                  <Loader2 className="w-8 h-8 text-gray-700 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading user details...</p>
                </div>
              ) : userDetails ? (
                <div className="p-6">
                  <div className="bg-neutral-50 text-black shadow-md rounded-sm p-4 mb-10">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      User Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Username
                        </label>
                        <p className="text-gray-500">{userDetails.username}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <p className="text-gray-500 flex items-center">
                          {userDetails.email}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <p className="text-gray-500 capitalize">
                          {userDetails.role}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Joined
                        </label>
                        <p className="text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(userDetails.createdAt)}
                        </p>
                      </div>
                      {userDetails.lastLoginAt && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Last Login
                          </label>
                          <p className="text-gray-500">
                            {formatDate(userDetails.lastLoginAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg text-black font-semibold mb-4 flex items-center">
                      Property Interests ({userDetails.totalInterests})
                    </h4>

                    {userDetails.interests.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h5 className="text-lg font-medium text-gray-500 mb-2">
                          No Interests Yet
                        </h5>
                        <p className="text-gray-500">
                          This user hasn&#39;t shown interest in any properties.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {userDetails.interests.map((interest) => (
                          <div
                            key={interest.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-500 mb-1">
                                  {interest.propertyTitle}
                                </h5>
                                <div className="flex items-center text-sm text-gray-600 space-x-4">
                                  <span className="flex items-center">
                                    <Phone className="w-4 h-4 mr-1" />
                                    {interest.userPhone}
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {formatDate(interest.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  interest.status
                                )}`}
                              >
                                {interest.status}
                              </span>
                            </div>

                            {interest.message && (
                              <div className="mt-3 p-3 bg-gray-50 rounded">
                                <div className="flex items-start">
                                  <MessageCircle className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                                  <p className="text-sm text-gray-700 italic">
                                    &#34;{interest.message}&#34;
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-600">Failed to load user details.</p>
                </div>
              )}
            </div>

            <div className="flex justify-center border-t py-5 w-full mx-auto">
              <button
                onClick={closeModal}
                className="px-8 py-2.5 bg-neutral-200 text-black rounded-sm hover:bg-neutral-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersTab;
