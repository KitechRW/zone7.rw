import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Hero from "../components/Welcome";
import PropertyGrid from "../components/PropertyGrid";
import FilterBar from "../components/FilterBar";
import Footer from "../components/Footer";
import { mockProperties } from "@/util/TempData";
import SearchBar from "@/components/SearchBar";
import { Filter } from "lucide-react";

const Home = () => {
  const [properties, setProperties] = useState(mockProperties);
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

  // Memoize the filter function to prevent unnecessary re-renders
  const applyFilters = useCallback(() => {
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
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

      // Apply type filter
      if (activeFilters.type !== "all") {
        result = result.filter(
          (property) => property.type === activeFilters.type
        );
      }

      // Apply category filter
      if (activeFilters.category !== "all") {
        result = result.filter(
          (property) => property.category === activeFilters.category
        );
      }

      // Apply price range filter
      result = result.filter(
        (property) =>
          property.price >= activeFilters.minPrice &&
          property.price <= activeFilters.maxPrice
      );

      // Apply bedroom filter
      if (activeFilters.bedrooms > 0) {
        result = result.filter(
          (property) =>
            property.bedrooms && property.bedrooms >= activeFilters.bedrooms
        );
      }

      // Apply bathroom filter
      if (activeFilters.bathrooms > 0) {
        result = result.filter(
          (property) =>
            property.bathrooms && property.bathrooms >= activeFilters.bathrooms
        );
      }

      // Apply area filter
      result = result.filter(
        (property) =>
          property.area >= activeFilters.minArea &&
          property.area <= activeFilters.maxArea
      );

      setFilteredProperties(result);
      setIsLoading(false);
    }, 300);
  }, [searchQuery, properties, activeFilters]);

  const handleFilterChange = (newFilters: any) => {
    setActiveFilters(newFilters);
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
    setSearchQuery("");
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      applyFilters();
    }, 500); // 500ms debounce for search

    return () => {
      clearTimeout(handler);
    };
  }, [applyFilters]);

  return (
    <div className="mx-auto max-w-[2000px]">
      <Head>
        <title>Find Your Dream Property</title>
        <meta
          name="description"
          content="Find your dream property from our curated selection of homes, plots, and investment opportunities."
        />
      </Head>

      <Header />
      <Hero />

      <main className="mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="xs:text-4xl md:text-6xl text-light-blue font-bold text-center mb-5">
            Property Listings
          </h2>
          <p className="text-black md:text-lg text-center mb-10 font-medium">
            Discover our exclusive selection of the finest properties
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center gap-2 bg-white text-light-blue border-2 border-light-blue px-4 rounded-lg font-medium hover:bg-blue-50 cursor-pointer transition"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {isFilterOpen && (
            <FilterBar
              onFilterChange={handleFilterChange}
              activeFilters={activeFilters}
              onApplyFilters={() => {}} // ✅ Remove manual trigger since useEffect handles it
              onClearFilters={clearAllFilters}
            />
          )}

          <div className="mb-6 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <h3 className="font-medium text-blue-800">
                  Active Filters: &nbsp;
                </h3>
                <div className="flex flex-wrap gap-2">
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
                      {activeFilters.maxArea.toLocaleString()} sq ft
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
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
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
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
