"use client";

import { RefObject, useEffect, useState } from "react";
import SearchBar from "@/components/misc/SearchBar";
import { Filter } from "lucide-react";
import { useFilter } from "@/contexts/FilterContext";
import FilterBar from "@/components/misc/FilterBar";
import PropertyGrid from "@/components/properties/PropertyGrid";
import Loader from "@/components/misc/Loader";
import { AnimatePresence, motion } from "framer-motion";
import Header2 from "@/components/layout/Header2";
import Footer2 from "@/components/layout/Footer2";

interface ListingsProps {
  propertyRef: RefObject<HTMLDivElement | null>;
}

const PropertyPage: React.FC<ListingsProps> = ({ propertyRef }) => {
  const {
    activeFilters,
    filteredProperties,
    searchQuery,
    isFilterOpen,
    isLoading,
    updateFilters,
    setSearchQuery,
    toggleFilter,
    clearAllFilters,
  } = useFilter();

  const [pageLoading, SetPageLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      SetPageLoading(false);
    }, 1000);
  }, []);

  return pageLoading ? (
    <Loader className="min-h-screen" />
  ) : (
    <section className="overflow-x-hidden">
      <Header2 />
      <div ref={propertyRef} className="max-w-7xl mx-auto mt-20 p-5 mb-12">
        <h2 className="xs:text-4xl md:text-5xl lg:text-6xl text-center font-bold mb-5">
          <span className="bg-gradient-to-r from-light-blue to-blue-800 bg-clip-text text-transparent">
            Property Listings
          </span>
        </h2>
        <p className="text-black md:text-lg text-center mb-10 font-medium">
          Own or rent a property from our collection of available listings.
        </p>

        <div className="flex xs:flex-col md:flex-row items-center justify-center gap-4 mb-8">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <button
            onClick={toggleFilter}
            className="xs:flex lg:hidden xs:w-full items-center justify-center gap-2 bg-white text-light-blue border-2 border-gray-300 px-4 py-3.5 rounded-sm font-medium hover:bg-blue-50 cursor-pointer transition"
          >
            <Filter className="w-5 h-5" />
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

        <div className="rounded-sm">
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
                    {activeFilters.maxArea.toLocaleString()} m<sup></sup>
                  </span>
                )}
              </div>
            </div>

            {(activeFilters.type !== "all" ||
              activeFilters.category !== "all" ||
              activeFilters.minPrice !== 100000 ||
              activeFilters.maxPrice !== 200000000 ||
              activeFilters.bedrooms !== 0 ||
              activeFilters.bathrooms !== 0 ||
              activeFilters.minArea !== 0 ||
              activeFilters.maxArea !== 20000 ||
              searchQuery.trim()) && (
              <button
                onClick={clearAllFilters}
                className="text-blue-900 hover:text-black text-sm font-medium  cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
        <div className=" m-4">
          <p
            className={`text-gray-600 text-sm ${
              isLoading ? "animate-bounce" : ""
            }`}
          >
            {isLoading
              ? "Loading properties..."
              : `${filteredProperties.length} properties found`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-start">
            <div className="relative bg-neutral-300 w-full h-96 rounded-xl animate-pulse"></div>
            <div className="relative bg-neutral-300 w-full h-96 rounded-xl animate-pulse"></div>
            <div className="relative bg-neutral-300 w-full h-96 rounded-xl animate-pulse"></div>
          </div>
        ) : (
          <PropertyGrid properties={filteredProperties} />
        )}
      </div>
      <Footer2 />
    </section>
  );
};

export default PropertyPage;
