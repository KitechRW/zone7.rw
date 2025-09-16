"use client";

import { useState, useMemo } from "react";
import {
  Heart,
  Search,
  ChevronDown,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import { useProperty } from "@/contexts/PropertyContext";

interface Interest {
  id: string;
  propertyId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  date: string;
  message?: string;
  status: "new" | "contacted" | "closed";
}

const mockInterests: Interest[] = [
  {
    id: "1",
    propertyId: "1",
    userName: "Kalisa David",
    userEmail: "dkalisa@example.com",
    userPhone: "+250788123456",
    date: "2025-03-01",
    message: "I'm interested in viewing this property this weekend.",
    status: "new",
  },
  {
    id: "2",
    propertyId: "2",
    userName: "Isano Odette",
    userEmail: "odette@example.com",
    userPhone: "+250789654321",
    date: "2025-03-02",
    message: "Could you please provide more details about the neighborhood?",
    status: "contacted",
  },
  {
    id: "3",
    propertyId: "1",
    userName: "Uwimana Jean",
    userEmail: "jean.uwimana@example.com",
    date: "2025-02-28",
    status: "new",
  },
  {
    id: "4",
    propertyId: "3",
    userName: "Mutesi Sarah",
    userEmail: "sarah.mutesi@example.com",
    userPhone: "+250787456789",
    date: "2025-03-03",
    message: "Is the property still available for rent?",
    status: "closed",
  },
  {
    id: "5",
    propertyId: "2",
    userName: "Habimana Eric",
    userEmail: "eric.habimana@example.com",
    date: "2025-02-25",
    status: "contacted",
  },
  {
    id: "6",
    propertyId: "4",
    userName: "Niyonzima Grace",
    userEmail: "grace.niyonzima@example.com",
    userPhone: "+250783456789",
    date: "2025-03-05",
    message: "I would like to schedule a viewing for next week.",
    status: "new",
  },
  {
    id: "7",
    propertyId: "3",
    userName: "Bizimana Patrick",
    userEmail: "patrick.bizimana@example.com",
    date: "2025-02-20",
    status: "closed",
  },
  {
    id: "8",
    propertyId: "1",
    userName: "Uwimana Alice",
    userEmail: "alice.uwimana@example.com",
    userPhone: "+250786543210",
    date: "2025-03-06",
    message: "What's the monthly rent including utilities?",
    status: "new",
  },
  {
    id: "9",
    propertyId: "5",
    userName: "Nkurunziza Paul",
    userEmail: "paul.nkurunziza@example.com",
    date: "2025-02-15",
    status: "contacted",
  },
  {
    id: "10",
    propertyId: "2",
    userName: "Murekatete Rose",
    userEmail: "rose.murekatete@example.com",
    userPhone: "+250785432109",
    date: "2025-03-07",
    message: "Is parking included with the property?",
    status: "new",
  },
  {
    id: "11",
    propertyId: "4",
    userName: "Gasana Michel",
    userEmail: "michel.gasana@example.com",
    date: "2025-02-10",
    status: "closed",
  },
  {
    id: "12",
    propertyId: "6",
    userName: "Nyiramana Claire",
    userEmail: "claire.nyiramana@example.com",
    userPhone: "+250784321098",
    date: "2025-03-08",
    message: "Can I negotiate the price?",
    status: "new",
  },
];

const ITEMS_PER_PAGE = 10;

const InterestsTab = () => {
  const { properties } = useProperty();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "new" | "contacted" | "closed"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "userName" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter and sort interests
  const filteredAndSortedInterests = useMemo(() => {
    const filtered = mockInterests.filter((interest) => {
      const matchesSearch =
        interest.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interest.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (interest.message &&
          interest.message.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || interest.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort interests
    filtered.sort((a, b) => {
      let aValue: string | Date = a[sortBy];
      let bValue: string | Date = b[sortBy];

      if (sortBy === "date") {
        aValue = new Date(aValue as string);
        bValue = new Date(bValue as string);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchQuery, statusFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedInterests.length / ITEMS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInterests = filteredAndSortedInterests.slice(
    startIndex,
    endIndex
  );

  const handleSort = (column: "date" | "userName" | "status") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleStatusUpdate = (
    interestId: string,
    newStatus: Interest["status"]
  ) => {
    // Here you would typically call an API to update the interest status
    console.log("Updating interest status:", interestId, newStatus);
  };

  const handleDelete = (interestId: string) => {
    if (deleteConfirm === interestId) {
      // Here you would typically call an API to delete the interest
      console.log("Deleting interest:", interestId);
      setDeleteConfirm(null);
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

  const getStatusColor = (status: Interest["status"]) => {
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

  const getPropertyTitle = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    return property?.title || "Property not found";
  };

  // Statistics
  const stats = useMemo(() => {
    return {
      total: mockInterests.length,
      new: mockInterests.filter((i) => i.status === "new").length,
      contacted: mockInterests.filter((i) => i.status === "contacted").length,
      closed: mockInterests.filter((i) => i.status === "closed").length,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
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
                  {stats.total}
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
                  {stats.new}
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
                  {stats.contacted}
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
                  {stats.closed}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
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

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Sort by:
              </span>
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [column, order] = e.target.value.split("-");
                    setSortBy(column as "date" | "userName" | "status");
                    setSortOrder(order as "asc" | "desc");
                  }}
                  className="appearance-none bg-white border border-gray-300 rounded-sm px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="userName-asc">Name A-Z</option>
                  <option value="userName-desc">Name Z-A</option>
                  <option value="status-asc">Status A-Z</option>
                  <option value="status-desc">Status Z-A</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {(searchQuery || statusFilter !== "all") && (
          <div className="mt-4 text-sm text-gray-600">
            Found {filteredAndSortedInterests.length} interest
            {filteredAndSortedInterests.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
            {statusFilter !== "all" && ` with status "${statusFilter}"`}
          </div>
        )}
      </div>

      {/* Interests Table */}
      <div className="bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Property Interests
            </h3>
            <span className="text-sm text-gray-500">
              {filteredAndSortedInterests.length} total
            </span>
          </div>
        </div>

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
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortBy === "date" && (
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
              {currentInterests.map((interest) => (
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
                      {getPropertyTitle(interest.propertyId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={interest.status}
                      onChange={(e) =>
                        handleStatusUpdate(
                          interest.id,
                          e.target.value as Interest["status"]
                        )
                      }
                      className={`text-xs font-medium px-2.5 py-1.5 rounded-sm border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(
                        interest.status
                      )}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(interest.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        onClick={() =>
                          window.open(`mailto:${interest.userEmail}`, "_blank")
                        }
                        title="Send Email"
                      >
                        Contact
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 transition-colors"
                        onClick={() => handleDelete(interest.id)}
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
                            Are you sure you want to remove this interest from{" "}
                            <strong>{interest.userName}</strong>? This action
                            cannot be undone.
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <button
                              onClick={() => handleDelete(interest.id)}
                              className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer transition-colors"
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="bg-gray-200 text-black font-semibold px-4 py-2 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
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

        {/* Empty State */}
        {currentInterests.length === 0 && (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(endIndex, filteredAndSortedInterests.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredAndSortedInterests.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
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
                    onClick={() => handlePageChange(currentPage + 1)}
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
  );
};

export default InterestsTab;
