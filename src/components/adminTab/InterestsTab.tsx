"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Heart,
  Mail,
  Phone,
  MessageCircle,
  Loader2,
  Eye,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useInterest } from "@/contexts/InterestContext";
import SearchBar from "../misc/SearchBar";

interface InterestsTabProps {
  filterByUserId?: string | null;
  filterByUserName?: string;
  onClearUserFilter?: () => void;
}

const ITEMS_PER_PAGE = 10;

const InterestsTab = ({
  filterByUserId,
  filterByUserName,
  onClearUserFilter,
}: InterestsTabProps = {}) => {
  const {
    interests,
    loading,
    error,
    stats,
    pagination,
    fetchInterests,
    fetchUserInterests,
    updateInterestStatus,
    deleteInterest,
    fetchStats,
    clearInterests,
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
  const [detailsModal, setDetailsModal] = useState<string | null>(null);

  // Load data whenever filters change
  useEffect(() => {
    const loadData = async () => {
      try {
        if (filterByUserId) {
          // When filtering by specific user, clear existing data first
          clearInterests();
          await fetchUserInterests(filterByUserId);
        } else {
          // Load all interests with filters
          const filters = {
            status: statusFilter === "all" ? undefined : statusFilter,
            search: searchQuery || undefined,
          };
          await Promise.all([
            fetchInterests(filters, currentPage, ITEMS_PER_PAGE),
            fetchStats(),
          ]);
        }
      } catch (error) {
        console.error("Failed to load interests data:", error);
      }
    };

    loadData();
  }, [
    searchQuery,
    statusFilter,
    currentPage,
    filterByUserId,
    fetchInterests,
    fetchUserInterests,
    fetchStats,
    clearInterests,
  ]);

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
      if (!filterByUserId) {
        await fetchStats();
      }
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

        if (!filterByUserId) {
          await fetchStats();
        }

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
      if (filterByUserId) {
        await fetchUserInterests(filterByUserId);
      } else {
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
      }
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
                <RotateCcw className="h-4 w-4" />
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
      {stats && !filterByUserId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-sm shadow-sm p-6">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-800 truncate">
                    Total Interests
                  </dt>
                  <dd className="font-medium text-gray-900">
                    {stats?.total || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-sm shadow-sm p-6">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-800 truncate">
                    New
                  </dt>
                  <dd className="font-medium text-gray-900">
                    {stats?.new || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-sm shadow-sm p-6">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Contacted
                  </dt>
                  <dd className="font-medium text-gray-900">
                    {stats?.contacted || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-sm shadow-sm p-6">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Closed
                  </dt>
                  <dd className="font-medium text-gray-900">
                    {stats?.closed || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter by specific user */}
      {filterByUserId ? (
        <div className="bg-white shadow-sm text-xs rounded-sm p-4 mb-10">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 gap-2">
              Showing interests for:{" "}
              <span className="font-medium text-gray-800">
                {filterByUserName}
              </span>
            </p>
            <button
              onClick={onClearUserFilter}
              className="text-light-blue hover:underline font-medium cursor-pointer"
            >
              Show All Interests
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-sm shadow-sm p-5 mb-10">
          <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                  Sort by:
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
                    className="w-24 py-3 px-3 text-left text-gray-500 text-xs bg-white cursor-pointer border border-gray-300 rounded-t-lg hover:border-gray-400 focus:outline-none focus:border-gray-800 transition-all duration-200 flex items-center justify-between"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 bg-neutral-200 text-gray-700 text-sm rounded-sm hover:bg-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5 mt-0.5 rotate-90" />
                )}
                Refresh
              </button>
            </div>
          </div>

          {(searchQuery || statusFilter !== "all") && (
            <div className="mt-4 text-xs text-gray-600">
              Found {pagination.total} interest
              {pagination.total !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
              {statusFilter !== "all" && ` with status "${statusFilter}"`}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-sm shadow-sm overflow-hidden">
        {loading && interests.length === 0 ? (
          <div className="bg-white rounded-sm shadow-sm p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 mb-8" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("userName")}
                    >
                      <div className="flex items-center gap-1">
                        Users
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
                          <span className="text-gray-600">
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
                        Date Placed
                        {sortBy === "createdAt" && (
                          <span className="text-gray-600">
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
                      <td className="p-4">
                        <div className="max-w-40 space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {interest.userName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2 line-clamp-1">
                            <Mail className="h-3 w-3 mt-1" />
                            {interest.userEmail}
                          </div>
                          {interest.userPhone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {interest.userPhone}
                            </div>
                          )}
                          {interest.message && (
                            <div className="text-xs text-gray-400 flex items-center gap-1.5">
                              <MessageCircle className="h-3 w-3 flex-shrink-0" />
                              <span className="line-clamp-1">
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
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-sm border-0 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${getStatusColor(
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
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => setDetailsModal(interest.id)}
                            className="text-gray-400 hover:text-blue-900 transition-colors"
                            title="View Message"
                          >
                            <Eye className="h-4 w-4 cursor-pointer" />
                          </button>

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
                            <Mail className="h-4 w-4 cursor-pointer" />
                          </button>
                          <button
                            title="Remove Interest"
                            className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                            onClick={() => handleDelete(interest.id)}
                            disabled={updatingInterest === interest.id}
                          >
                            <Trash2 className="h-4 w-4 cursor-pointer" />
                          </button>
                        </div>

                        {detailsModal === interest.id && (
                          <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-40">
                            <div className="flex flex-col items-center justify-center gap-6 bg-white p-6 text-gray-700 min-w-sm mx-4 rounded-sm">
                              <h4 className="text-xl text-center font-semibold">
                                Full Message
                              </h4>
                              <p className="italic text-gray-600 py-5">
                                {interest.message}
                              </p>

                              <button
                                onClick={() => setDetailsModal(null)}
                                className="w-20 bg-neutral-100 text-gray-800 border border-gray-300 px-4 py-2 rounded-md hover:bg-neutral-200 transition-colors cursor-pointer"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        )}

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
                  {filterByUserId
                    ? `${filterByUserName} has not placed any interests yet`
                    : searchQuery || statusFilter !== "all"
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
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages || loading}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                          } cursor-pointer`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.pages || loading}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
