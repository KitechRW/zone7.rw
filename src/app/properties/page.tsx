"use client";

import { RefObject, useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { useFilter } from "@/contexts/FilterContext";
import { useProperty } from "@/contexts/PropertyContext";
import FilterBar, { FilterState } from "@/components/misc/FilterBar";
import PropertyGrid from "@/components/properties/PropertyGrid";
import Loader from "@/components/misc/Loader";
import { AnimatePresence, motion } from "framer-motion";
import Header2 from "@/components/layout/Header2";
import Footer2 from "@/components/layout/Footer2";
import { PropertyFilters } from "@/types/Properties";

interface FeaturedProps {
  propertyRef: RefObject<HTMLDivElement | null>;
}

const PropertyPage: React.FC<FeaturedProps> = ({ propertyRef }) => {
  const {
    activeFilters,
    searchQuery,
    isFilterOpen,
    updateFilters,
    toggleFilter,
    clearAllFilters,
  } = useFilter();

  const {
    properties,
    loading: propertiesLoading,
    error,
    pagination,
    fetchProperties,
    clearError,
  } = useProperty();

  const [pageLoading, setPageLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize the page
  useEffect(() => {
    const initializePage = async () => {
      try {
        await fetchProperties({}, 1, 12);
      } catch (error) {
        console.error("Failed to load properties:", error);
      } finally {
        setTimeout(() => setPageLoading(false), 1000);
      }
    };

    initializePage();
  }, [fetchProperties]);

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

  // Handle filter changes
  useEffect(() => {
    if (!pageLoading) {
      const filters = createPropertyFilters(activeFilters, searchQuery);

      fetchProperties(filters, 1, 12);
      setCurrentPage(1);
    }
  }, [activeFilters, searchQuery, fetchProperties, pageLoading]);

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    const filters = createPropertyFilters(activeFilters, searchQuery);

    await fetchProperties(filters, page, 12);
  };

  const hasActiveFilters =
    activeFilters.type !== "all" ||
    activeFilters.category !== "all" ||
    activeFilters.minPrice !== 100000 ||
    activeFilters.maxPrice !== 200000000 ||
    activeFilters.bedrooms !== 0 ||
    activeFilters.bathrooms !== 0 ||
    activeFilters.minArea !== 0 ||
    activeFilters.maxArea !== 20000 ||
    searchQuery.trim();

  return pageLoading ? (
    <Loader className="h-screen" />
  ) : (
    <section className="overflow-x-hidden">
      <Header2 />
      <div
        ref={propertyRef}
        className="max-w-7xl mx-auto mt-20 xs:px-10 lg:px-5 mb-24"
      >
        <h2 className="xs:text-4xl md:text-5xl lg:text-6xl text-center font-bold py-5 mb-5">
          <span className="bg-blue-900 bg-clip-text text-transparent">
            Property Listings
          </span>
        </h2>
        <p className="text-black md:text-lg text-center mb-10 font-medium">
          Own or rent a property from our collection of available listings.
        </p>

        {error && (
          <div className="bg-gray-50 border border-gray-200 text-red-800 px-4 py-5 rounded-sm mb-6 text-center">
            <p>{error}</p>
            <button
              onClick={() => {
                clearError();
                fetchProperties({}, currentPage, 12);
              }}
              className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-sm hover:bg-red-700 transition-colors mt-2 mr-2 cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        <div className="flex xs:flex-col md:flex-row items-center justify-center gap-4 mb-4">
          <button
            onClick={toggleFilter}
            className="xs:flex lg:hidden xs:w-full items-center justify-center gap-2 bg-neutral-100 text-blue-600 text-sm border-2 border-gray-300 px-4 py-3 rounded-sm font-medium hover:bg-neutral-200/50 cursor-pointer transition"
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

        <div className="mb-8 rounded-lg">
          <div className="flex xs:flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex xs:flex-col md:flex-row justify-center items-center gap-1">
              <div className="flex justify-center flex-wrap gap-2">
                {activeFilters.type !== "all" && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Type: {activeFilters.type}
                  </span>
                )}
                {activeFilters.category !== "all" && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Category:{" "}
                    {activeFilters.category === "sale"
                      ? "For Sale"
                      : "For Rent"}
                  </span>
                )}

                {(activeFilters.minPrice !== 100000 ||
                  activeFilters.maxPrice !== 200000000) && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Price: Rwf{activeFilters.minPrice.toLocaleString()} - Rwf
                    {activeFilters.maxPrice.toLocaleString()}
                  </span>
                )}
                {activeFilters.bedrooms > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Bedrooms: {activeFilters.bedrooms}+
                  </span>
                )}
                {activeFilters.bathrooms > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Bathrooms: {activeFilters.bathrooms}+
                  </span>
                )}

                {(activeFilters.minArea !== 0 ||
                  activeFilters.maxArea !== 20000) && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Area: {activeFilters.minArea.toLocaleString()} -{" "}
                    {activeFilters.maxArea.toLocaleString()} m²
                  </span>
                )}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-blue-900 hover:text-black text-sm font-medium cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {propertiesLoading ? (
          <div className="grid xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-start">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="relative bg-neutral-300 w-full h-96 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <>
            <PropertyGrid properties={properties} />

            {pagination.pages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || propertiesLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>

                {[...Array(pagination.pages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    disabled={propertiesLoading}
                    className={`px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 border  disabled:cursor-not-allowed cursor-pointer ${
                      currentPage === index + 1
                        ? "bg-blue-50 border-light-blue text-light-blue"
                        : "text-gray-700 bg-white  border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    currentPage === pagination.pages || propertiesLoading
                  }
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters
                  ? "Try adjusting your filters or search terms."
                  : "No properties are currently available."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-light-blue hover:text-blue-600 font-medium cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer2 />
    </section>
  );
};

export default PropertyPage;
