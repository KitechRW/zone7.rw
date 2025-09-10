"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Welcome";
import PropertyGrid from "../components/PropertyGrid";
import FilterBar, { FilterState } from "../components/FilterBar";
import Footer from "../components/Footer";
import { mockProperties } from "@/util/TempData";
import SearchBar from "@/components/SearchBar";
import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Benefits from "./Benefits";

const HomeComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [properties] = useState(mockProperties);
  const [filteredProperties, setFilteredProperties] = useState(mockProperties);
  const [activeFilters, setActiveFilters] = useState({
    type: "all",
    category: "all",
    minPrice: 100000,
    maxPrice: 200000000,
    bedrooms: 0,
    bathrooms: 0,
    minArea: 0,
    maxArea: 20000,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [skipUrlSync, setSkipUrlSync] = useState(false);

  useEffect(() => {
    if (skipUrlSync) {
      setSkipUrlSync(false);
      return;
    }

    const category = searchParams.get("category");
    const type = searchParams.get("type");

    if (category || type) {
      setActiveFilters((prev) => ({
        ...prev,
        category: category || prev.category,
        type: type || prev.type,
      }));
    }
  }, [searchParams, skipUrlSync]);

  const handleFilterUpdate = useCallback(
    (newFilters: { category: string; type: string }) => {
      setSkipUrlSync(true);
      setActiveFilters((prev) => ({
        ...prev,
        category: newFilters.category,
        type: newFilters.type,
      }));

      // Update URL after state is set
      setTimeout(() => {
        const params = new URLSearchParams();
        params.set("category", newFilters.category);
        params.set("type", newFilters.type);
        router.replace(`?${params.toString()}`, { scroll: false });
      }, 100);
    },
    [router]
  );

  const applyFilters = useCallback(() => {
    setIsLoading(true);

    let result = [...properties];

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (property) =>
          property.title.toLowerCase().includes(query) ||
          property.type.toLowerCase().includes(query) ||
          property.category.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query) ||
          (property.description &&
            property.description.toLowerCase().includes(query))
      );
    }

    if (activeFilters.type !== "all") {
      result = result.filter(
        (property) => property.type === activeFilters.type
      );
    }

    if (activeFilters.category !== "all") {
      result = result.filter(
        (property) => property.category === activeFilters.category
      );
    }

    result = result.filter(
      (property) =>
        property.price >= activeFilters.minPrice &&
        property.price <= activeFilters.maxPrice
    );

    if (activeFilters.bedrooms > 0) {
      result = result.filter(
        (property) =>
          property.bedrooms && property.bedrooms >= activeFilters.bedrooms
      );
    }

    if (activeFilters.bathrooms > 0) {
      result = result.filter(
        (property) =>
          property.bathrooms && property.bathrooms >= activeFilters.bathrooms
      );
    }

    result = result.filter(
      (property) =>
        property.area >= activeFilters.minArea &&
        property.area <= activeFilters.maxArea
    );

    setFilteredProperties(result);
    setIsLoading(false);
  }, [searchQuery, properties, activeFilters]);

  const handleFilterChange = (newFilters: FilterState) => {
    setActiveFilters(newFilters);

    const params = new URLSearchParams();
    if (newFilters.category !== "all")
      params.set("category", newFilters.category);
    if (newFilters.type !== "all") params.set("type", newFilters.type);
    if (newFilters.minPrice !== 100000)
      params.set("minPrice", newFilters.minPrice.toString());
    if (newFilters.maxPrice !== 200000000)
      params.set("maxPrice", newFilters.maxPrice.toString());
    if (newFilters.bedrooms > 0)
      params.set("bedrooms", newFilters.bedrooms.toString());
    if (newFilters.bathrooms > 0)
      params.set("bathrooms", newFilters.bathrooms.toString());
    if (newFilters.minArea > 0)
      params.set("minArea", newFilters.minArea.toString());
    if (newFilters.maxArea < 20000)
      params.set("maxArea", newFilters.maxArea.toString());

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : "/");
  };

  const clearAllFilters = () => {
    const resetFilters = {
      type: "all",
      category: "all",
      minPrice: 100000,
      maxPrice: 200000000,
      bedrooms: 0,
      bathrooms: 0,
      minArea: 0,
      maxArea: 20000,
    };

    setActiveFilters(resetFilters);
    router.replace("/", { scroll: false });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      applyFilters();
    }, 500); // 500ms debounce for search

    return () => {
      clearTimeout(handler);
    };
  }, [applyFilters]);

  //Smooth scrolls
  const homeRef = useRef<HTMLDivElement | null>(null);
  const propertyRef = useRef<HTMLDivElement | null>(null);

  const homeScroll = () => {
    if (homeRef.current) {
      homeRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const propertyScroll = () => {
    if (propertyRef.current) {
      propertyRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <Header scrollToProperties={propertyScroll} scrollToHome={homeScroll} />
      <Hero
        scrollToProperties={propertyScroll}
        homeRef={homeRef}
        onFilterUpdate={handleFilterUpdate}
      />

      <section className="max-w-[1600px] mx-auto px-20 py-10">
        <div ref={propertyRef} className="mb-12">
          <h2 className="xs:text-4xl md:text-6xl text-light-blue font-bold text-center mb-5">
            Property Listings
          </h2>
          <p className="text-black md:text-lg text-center mb-10 font-medium">
            Own or rent a property from our collection of available listings.
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center gap-2 bg-white text-light-blue border-2 border-light-blue px-4 rounded-sm font-medium hover:bg-blue-50 cursor-pointer transition"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {isFilterOpen && (
            <FilterBar
              onFilterChange={handleFilterChange}
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
      <Benefits />
      <Footer scrollToHome={homeScroll} />
    </>
  );
};

export default HomeComponent;
