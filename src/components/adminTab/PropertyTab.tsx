"use client";

import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Eye,
  Building2,
  MapPin,
  Bed,
  Bath,
  LandPlot,
  Filter,
  Star,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { useFilter } from "@/contexts/FilterContext";
import { useProperty } from "@/contexts/PropertyContext";
import {
  CreatePropertyFormData,
  Property,
  PropertyFilters,
} from "@/types/Properties";
import { motion, AnimatePresence } from "framer-motion";
import FilterBar, { FilterState } from "@/components/misc/FilterBar";
import PropertyModal from "@/components/properties/PropertyModal";

const PropertiesTab = () => {
  const {
    properties,
    loading: propertiesLoading,
    error,
    stats,
    pagination,
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    clearError,
  } = useProperty();

  const {
    activeFilters,
    searchQuery,
    isFilterOpen,
    updateFilters,
    toggleFilter,
    clearAllFilters,
  } = useFilter();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const createPropertyFilters = (
    activeFilters: FilterState,
    searchQuery: string | undefined
  ): PropertyFilters => {
    const filters: PropertyFilters = {};

    // Only add filters if they have actual values (not default/empty values)
    if (activeFilters.type && activeFilters.type !== "all") {
      filters.type = activeFilters.type as "house" | "plot";
    }

    if (activeFilters.category && activeFilters.category !== "all") {
      filters.category = activeFilters.category as "sale" | "rent";
    }

    if (activeFilters.minPrice && activeFilters.minPrice !== 100000) {
      filters.minPrice = activeFilters.minPrice;
    }

    if (activeFilters.maxPrice && activeFilters.maxPrice !== 200000000) {
      filters.maxPrice = activeFilters.maxPrice;
    }

    if (activeFilters.bedrooms && activeFilters.bedrooms > 0) {
      filters.bedrooms = activeFilters.bedrooms;
    }

    if (activeFilters.bathrooms && activeFilters.bathrooms > 0) {
      filters.bathrooms = activeFilters.bathrooms;
    }

    if (activeFilters.minArea && activeFilters.minArea > 0) {
      filters.minArea = activeFilters.minArea;
    }

    if (activeFilters.maxArea && activeFilters.maxArea !== 20000) {
      filters.maxArea = activeFilters.maxArea;
    }

    if (
      activeFilters.featured !== undefined &&
      activeFilters.featured !== false
    ) {
      filters.featured = activeFilters.featured;
    }

    if (activeFilters.location && activeFilters.location.trim()) {
      filters.location = activeFilters.location.trim();
    }

    if (searchQuery && searchQuery.trim()) {
      filters.search = searchQuery.trim();
    }

    return filters;
  };

  useEffect(() => {
    const filters = createPropertyFilters(activeFilters, searchQuery);
    fetchProperties(filters, 1, 10);
    setCurrentPage(1);
  }, [activeFilters, searchQuery, fetchProperties]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const openModal = (mode: "create" | "edit" | "view", property?: Property) => {
    setModalMode(mode);
    setSelectedProperty(property || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProperty(null);
    clearError();
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try {
        await deleteProperty(id);
        setDeleteConfirm(null);
      } catch (error) {
        console.error("Failed to delete property:", error);
      }
    } else {
      setDeleteConfirm(id);
    }
  };

  const handleSubmit = async (
    propertyData: Partial<CreatePropertyFormData>
  ) => {
    try {
      if (modalMode === "create") {
        await createProperty(propertyData as CreatePropertyFormData);
      } else if (modalMode === "edit" && selectedProperty) {
        await updateProperty(selectedProperty.id, propertyData);
      }
      closeModal();
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Failed to save property:", error);
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    const filters = createPropertyFilters(activeFilters, searchQuery);
    await fetchProperties(filters, page, 10);
  };

  return (
    <div className="space-y-4">
      {isSuccess &&
        (modalMode === "create" ? (
          <div className="fixed top-20 right-4 z-50 bg-green-50 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              Property was created successfully.
            </span>
          </div>
        ) : (
          <div className="fixed top-20 right-4 z-50 bg-green-50 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              Property was updated successfully.
            </span>
          </div>
        ))}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          <div className="group bg-white hover:bg-blue-50 rounded-sm shadow-sm p-4 truncate transition-colors">
            <div className="flex items-center justify-between group-hover:-translate-x-2 transition-all duration-500">
              <div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-blue-800">
                  Total Properties
                </p>
                <p className="font-bold text-gray-900 group-hover:text-blue-900">
                  {stats.totalProperties}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white hover:bg-green-50 rounded-sm shadow-sm p-4 transition-colors">
            <div className="flex items-center justify-between group-hover:-translate-x-2 transition-all duration-500">
              <div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-green-800">
                  For Sale
                </p>
                <p className="font-bold text-gray-900 group-hover:text-green-900">
                  {stats.totalSales}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white hover:bg-blue-50 rounded-sm shadow-sm p-4 transition-colors">
            <div className="flex items-center justify-between group-hover:-translate-x-2 transition-all duration-500">
              <div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-blue-800">
                  For Rent
                </p>
                <p className="font-bold text-gray-900 group-hover:text-blue-900">
                  {stats.totalRentals}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white hover:bg-yellow-50 rounded-sm shadow-sm p-4 transition-colors">
            <div className="flex items-center justify-between group-hover:-translate-x-2 transition-all duration-500">
              <div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-yellow-800">
                  Featured
                </p>
                <p className="font-bold text-gray-900 group-hover:text-yellow-900">
                  {stats.featuredProperties}
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 group min-w-40 bg-white hover:bg-green-50 rounded-sm shadow-sm p-4 transition-colors">
            <div className="flex items-center justify-between group-hover:-translate-x-2 transition-all duration-500">
              <div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-green-800">
                  Total Value
                </p>
                <p className="font-bold text-gray-900 group-hover:text-green-900">
                  {formatPrice(stats.totalValue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        <button
          onClick={toggleFilter}
          className="lg:hidden w-full flex items-center justify-center gap-2 bg-white text-blue-900 border-2 border-gray-300 px-4 py-3 rounded-sm font-medium hover:bg-blue-50 cursor-pointer transition"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="lg:hidden">
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
                opacity: { duration: 0.2 },
              }}
              className="overflow-hidden"
            >
              <FilterBar
                toggleFilter={toggleFilter}
                onFilterChange={updateFilters}
                activeFilters={activeFilters}
                onClearFilters={clearAllFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="xs:hidden lg:block">
        <FilterBar
          toggleFilter={toggleFilter}
          onFilterChange={updateFilters}
          activeFilters={activeFilters}
          onClearFilters={clearAllFilters}
        />
      </div>

      <div className="flex flex-col items-end gap-3">
        {error && (
          <div className="max-w-6xl bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-lg text-sm wrap-break-word">
            {error}
          </div>
        )}

        <button
          onClick={() => openModal("create")}
          className="bg-gradient-to-r from-light-blue to-blue-900 text-white text-sm font-medium px-4 py-3 mb-4 mr-2 rounded-sm hover:shadow-lg transition-colors flex items-center justify-center gap-1 justify-self-end truncate cursor-pointer"
          disabled={propertiesLoading}
        >
          Add Property
        </button>
      </div>

      {propertiesLoading ? (
        <div className="bg-white rounded-sm shadow-sm p-4 sm:p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 sm:h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-sm shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Properties ({properties.length})
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Category
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-sm overflow-hidden flex-shrink-0">
                          <Image
                            src={property.mainImage}
                            alt={property.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="ml-2 sm:ml-4 min-w-0">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {property.title}
                            </div>
                            {property.featured && (
                              <Star className="h-4 w-4 cursor-pointer text-yellow-500 fill-current flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-2 w-2 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {property.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {property.type}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium capitalize ${
                            property.category === "sale"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {property.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-blue-950">
                      <div className="flex flex-col gap-1 rounded-sm p-1 sm:p-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <LandPlot className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                          <span className="text-sm">
                            {property.area.toLocaleString()} m²
                          </span>
                        </div>
                        {property.type === "house" && (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Bed className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                            <span className="text-sm">
                              {property.bedrooms} bed
                            </span>
                            <Bath className="h-2 w-2 sm:h-3 sm:w-3 ml-1 sm:ml-2 flex-shrink-0" />
                            <span className="text-sm">
                              {property.bathrooms} bath
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-800">
                        {formatPrice(property.price)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => openModal("view", property)}
                          className="text-gray-400 hover:text-blue-900 transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4 cursor-pointer" />
                        </button>
                        <button
                          onClick={() => openModal("edit", property)}
                          className="text-blue-600 hover:text-indigo-900 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 cursor-pointer" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(property.id)}
                          className="transition-colors text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 cursor-pointer" />
                        </button>
                      </div>
                      {deleteConfirm === property.id && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
                          <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 bg-white p-4 text-black w-full max-w-sm rounded-md">
                            <h4 className="text-base sm:text-lg text-center font-bold">
                              Confirm Delete?
                            </h4>
                            <div className="flex items-center gap-3 sm:gap-5 text-sm">
                              <button
                                onClick={() => handleDelete(property.id)}
                                className="bg-red-600 text-white font-semibold px-3 sm:px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer flex-1"
                              >
                                {propertiesLoading ? (
                                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white rounded-full border-t-transparent border-b-transparent border-l-transparent animate-spin mx-auto" />
                                ) : (
                                  "Delete"
                                )}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="bg-neutral-200 text-black font-semibold px-3 sm:px-4 py-2 rounded-md hover:bg-neutral-300 transition cursor-pointer flex-1"
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

          {properties.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No properties found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ||
                activeFilters.type !== "all" ||
                activeFilters.category !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating a new property"}
              </p>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="bg-white px-3 sm:px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-700 flex items-center">
                  {currentPage} of {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * 10 + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, pagination.total)}
                    </span>{" "}
                    of <span className="font-medium">{pagination.total}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Previous
                    </button>
                    {[...Array(pagination.pages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === index + 1
                            ? "z-10 bg-blue-50 border-light-blue text-light-blue"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        } cursor-pointer`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <PropertyModal
          mode={modalMode}
          property={selectedProperty}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default PropertiesTab;
