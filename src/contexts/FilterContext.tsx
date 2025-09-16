"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Property } from "@/types/Properties";
import { FilterState } from "@/components/misc/FilterBar";
import { useProperty } from "./PropertyContext";

interface FilterContextType {
  activeFilters: FilterState;
  filteredProperties: Property[];
  searchQuery: string;
  isFilterOpen: boolean;
  isLoading: boolean;
  updateFilters: (filters: Partial<FilterState>) => void;
  setSearchQuery: (query: string) => void;
  toggleFilter: () => void;
  clearAllFilters: () => void;
  applyUrlFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const defaultFilters: FilterState = {
  type: "all",
  category: "all",
  minPrice: 100000,
  maxPrice: 200000000,
  bedrooms: 0,
  bathrooms: 0,
  minArea: 0,
  maxArea: 20000,
  featured: false,
  location: "",
};

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { properties } = useProperty();

  const [activeFilters, setActiveFilters] =
    useState<FilterState>(defaultFilters);
  const [filteredProperties, setFilteredProperties] =
    useState<Property[]>(properties);
  const [searchQuery, setSearchQueryState] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Apply filters from URL on initial load
  useEffect(() => {
    const category = searchParams.get("category");
    const type = searchParams.get("type");

    if (category || type) {
      setActiveFilters((prev: FilterState) => ({
        ...prev,
        category: category || prev.category,
        type: type || prev.type,
      }));
    }
  }, [searchParams]);

  const applyFilters = useCallback(() => {
    setIsLoading(true);

    // Set timeout for UI to update before heavy computation
    setTimeout(() => {
      let result = [...properties];

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
    }, 0);
  }, [searchQuery, activeFilters, properties]);

  // Debounced filter application
  useEffect(() => {
    const handler = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [applyFilters]);

  // Update URL when filters change
  useEffect(() => {
    if (!window.location.pathname.match(/^\/(properties|search)?$/)) {
      return; // Don't update URL for other pages other than home
    }

    const params = new URLSearchParams();

    if (activeFilters.category !== "all")
      params.set("category", activeFilters.category);
    if (activeFilters.type !== "all") params.set("type", activeFilters.type);
    if (activeFilters.minPrice !== defaultFilters.minPrice)
      params.set("minPrice", activeFilters.minPrice.toString());
    if (activeFilters.maxPrice !== defaultFilters.maxPrice)
      params.set("maxPrice", activeFilters.maxPrice.toString());
    if (activeFilters.bedrooms > 0)
      params.set("bedrooms", activeFilters.bedrooms.toString());
    if (activeFilters.bathrooms > 0)
      params.set("bathrooms", activeFilters.bathrooms.toString());
    if (activeFilters.minArea > 0)
      params.set("minArea", activeFilters.minArea.toString());
    if (activeFilters.maxArea < defaultFilters.maxArea)
      params.set("maxArea", activeFilters.maxArea.toString());

    router.replace(
      params.toString() ? `?${params.toString()}` : window.location.pathname,
      {
        scroll: false,
      }
    );
  }, [activeFilters, router]);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setActiveFilters((prev: FilterState) => ({ ...prev, ...newFilters }));
  };

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
  };

  const toggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const clearAllFilters = () => {
    setActiveFilters(defaultFilters);
    setSearchQueryState("");
  };

  const applyUrlFilters = () => {
    applyFilters();
  };

  const value: FilterContextType = {
    activeFilters,
    filteredProperties,
    searchQuery,
    isFilterOpen,
    isLoading,
    updateFilters,
    setSearchQuery,
    toggleFilter,
    clearAllFilters,
    applyUrlFilters,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
};
