"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Heart,
  Search,
  ChevronDown,
  Mail,
  Phone,
  MessageCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useInterest } from "@/contexts/InterestContext";

const ITEMS_PER_PAGE = 10;

const InterestsTab = () => {
  const {
    interests,
    loading,
    error,
    stats,
    pagination,
    fetchInterests,
    updateInterestStatus,
    deleteInterest,
    fetchStats,
  } = useInterest();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "new" | "contacted" | "closed"
  >("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "userName" | "status">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [updatingInterest, setUpdatingInterest] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchInterests({}, 1, ITEMS_PER_PAGE),
          fetchStats(),
        ]);
      } catch (error) {
        console.error("Failed to load interests data:", error);
      }
    };

    loadData();
  }, [fetchInterests, fetchStats]);

  useEffect(() => {
    const filters = {
      status: statusFilter === "all" ? undefined : statusFilter,
      search: searchQuery || undefined,
    };

    fetchInterests(filters, currentPage, ITEMS_PER_PAGE);
  }, [searchQuery, statusFilter, currentPage, fetchInterests]);

  const handleSort = (column: "createdAt" | "userName" | "status") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleStatusUpdate = async (
    interestId: string,
    newStatus: "new" | "contacted" | "closed"
  ) => {
    try {
      setUpdatingInterest(interestId);
      await updateInterestStatus(interestId, newStatus);

      // Refresh stats
      await fetchStats();
    } catch (error) {
      console.error("Failed to update interest status:", error);
    } finally {
      setUpdatingInterest(null);
    }
  };

  const handleDelete = async (interestId: string) => {
    if (deleteConfirm === interestId) {
      try {
        setUpdatingInterest(interestId);
        await deleteInterest(interestId);
        setDeleteConfirm(null);

        await fetchStats();

        // If we're on the last page and it becomes empty, go to previous page
        if (interests.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error("Failed to delete interest:", error);
      } finally {
        setUpdatingInterest(null);
      }
    } else {
      setDeleteConfirm(interestId);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: "new" | "contacted" | "closed") => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Sort interests locally since API doesn't handle sorting yet
  const sortedInterests = useMemo(() => {
    const sorted = [...interests].sort((a, b) => {
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

    return sorted;
  }, [interests, sortBy, sortOrder]);

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchInterests(
          {
            status: statusFilter === "all" ? undefined : statusFilter,
            search: searchQuery || undefined,
          },
          currentPage,
          ITEMS_PER_PAGE
        ),
        fetchStats(),
      ]);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Failed to Load Interests
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-sm shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Interests
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                  ) : (
                    stats?.total || 0
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">N</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  New
                </dt>
                <dd className="text-lg font-medium text-blue-600">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                  ) : (
                    stats?.new || 0
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">C</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Contacted
                </dt>
                <dd className="text-lg font-medium text-yellow-600">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                  ) : (
                    stats?.contacted || 0
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-600 font-semibold">✓</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Closed
                </dt>
                <dd className="text-lg font-medium text-gray-600">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                  ) : (
                    stats?.closed || 0
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Status:
              </span>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(
                      e.target.value as "all" | "new" | "contacted" | "closed"
                    );
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-gray-300 rounded-sm px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </button>
          </div>
        </div>

        {(searchQuery || statusFilter !== "all") && (
          <div className="mt-4 text-sm text-gray-600">
            Found {pagination.total} interest
            {pagination.total !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
            {statusFilter !== "all" && ` with status "${statusFilter}"`}
          </div>
        )}
      </div>

      <div className="bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Property Interests
            </h3>
            <span className="text-sm text-gray-500">
              {pagination.total} total
            </span>
          </div>
        </div>

        {loading && interests.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading interests...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("userName")}
                    >
                      <div className="flex items-center gap-1">
                        User
                        {sortBy === "userName" && (
                          <span className="text-blue-600">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {sortBy === "status" && (
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
                        Date
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
                  {sortedInterests.map((interest) => (
                    <tr key={interest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {interest.userName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {interest.userEmail}
                          </div>
                          {interest.userPhone && (
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {interest.userPhone}
                            </div>
                          )}
                          {interest.message && (
                            <div className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                              <MessageCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">
                                {interest.message}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {interest.propertyTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={interest.status}
                          onChange={(e) =>
                            handleStatusUpdate(
                              interest.id,
                              e.target.value as "new" | "contacted" | "closed"
                            )
                          }
                          disabled={updatingInterest === interest.id}
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-sm border-0 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor(
                            interest.status
                          )}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                        {updatingInterest === interest.id && (
                          <Loader2 className="h-3 w-3 animate-spin ml-2 inline" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(interest.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            className="text-blue-600 hover:text-blue-900 transition-colors disabled:opacity-50"
                            onClick={() =>
                              window.open(
                                `mailto:${interest.userEmail}`,
                                "_blank"
                              )
                            }
                            title="Send Email"
                            disabled={updatingInterest === interest.id}
                          >
                            Contact
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                            onClick={() => handleDelete(interest.id)}
                            disabled={updatingInterest === interest.id}
                          >
                            Remove
                          </button>
                        </div>

                        {deleteConfirm === interest.id && (
                          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                            <div className="flex flex-col items-center justify-center gap-6 bg-white p-6 text-black w-80 max-w-sm mx-4 rounded-md">
                              <h4 className="text-lg text-center font-bold">
                                Remove Interest?
                              </h4>
                              <p className="text-sm text-gray-600 text-center">
                                This action cannot be undone.
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <button
                                  onClick={() => handleDelete(interest.id)}
                                  disabled={updatingInterest === interest.id}
                                  className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {updatingInterest === interest.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : null}
                                  Remove
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  disabled={updatingInterest === interest.id}
                                  className="bg-gray-200 text-black font-semibold px-4 py-2 rounded-md hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedInterests.length === 0 && !loading && (
              <div className="text-center py-12">
                <Heart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No interests found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || statusFilter !== "all"
                    ? "No interests match your current filters"
                    : "No users have shown interest in properties yet"}
                </p>
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages || loading}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          currentPage * ITEMS_PER_PAGE,
                          pagination.total
                        )}
                      </span>{" "}
                      of <span className="font-medium">{pagination.total}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {[...Array(pagination.pages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index + 1)}
                          disabled={loading}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium disabled:opacity-50 ${
                            currentPage === index + 1
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.pages || loading}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InterestsTab;
