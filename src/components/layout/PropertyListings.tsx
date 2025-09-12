"use client";

import { RefObject } from "react";
import FilterBar from "../misc/FilterBar";
import SearchBar from "@/components/misc/SearchBar";
import { Filter } from "lucide-react";
import { useFilter } from "@/contexts/FilterContext";
import PropertyGrid from "../properties/PropertyGrid";

interface ListingsProps {
  propertyRef: RefObject<HTMLDivElement | null>;
}

const PropertyListings: React.FC<ListingsProps> = ({ propertyRef }) => {
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

  return (
    <>
      <section className="max-w-[1600px] mx-auto px-20 py-10">
        <div ref={propertyRef} className="mb-12">
          <h2 className="xs:text-4xl md:text-6xl text-light-blue font-bold text-center mb-5">
            Property Listings
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
              className="flex items-center justify-center gap-2 bg-white text-light-blue border-2 border-light-blue/50 px-4 py-4 rounded-sm font-medium hover:bg-blue-50 cursor-pointer transition"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {isFilterOpen && (
            <FilterBar
              toggleFilter={toggleFilter}
              onFilterChange={updateFilters}
              activeFilters={activeFilters}
              onClearFilters={clearAllFilters}
            />
          )}

          <div className="mb-6 p-4 rounded-sm">
            <div className="flex xs:flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex xs:flex-col md:flex-row justify-center items-center gap-1">
                <h3 className="font-medium text-blue-950 text-center">
                  Active Filters: &nbsp;
                </h3>
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

                  {activeFilters.type === "all" &&
                    activeFilters.category === "all" &&
                    activeFilters.minPrice === 100000 &&
                    activeFilters.maxPrice === 200000000 &&
                    activeFilters.bedrooms === 0 &&
                    activeFilters.bathrooms === 0 &&
                    activeFilters.minArea === 0 &&
                    activeFilters.maxArea === 20000 &&
                    !searchQuery.trim() && (
                      <span className="text-gray-600 text-sm">
                        No filters applied
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
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          <div className="flex xs:justify-center md:justify-between items-center mb-6">
            <p className="text-gray-600">
              {isLoading
                ? "Loading properties..."
                : `${filteredProperties.length} properties found`}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <PropertyGrid properties={filteredProperties} />
          )}
        </div>
      </section>
    </>
  );
};

export default PropertyListings;
