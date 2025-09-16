import { useState, useEffect } from "react";
import Dropdown from "./Dropdown";
import SearchBar from "./SearchBar";
import { useFilter } from "@/contexts/FilterContext";
import { useProperty } from "@/contexts/PropertyContext";

export interface FilterState {
  type: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
  minArea: number;
  maxArea: number;
  featured: boolean;
  location: string;
}

interface FilterBarProps {
  toggleFilter: () => void;
  onFilterChange: (filters: FilterState) => void;
  activeFilters: FilterState;
  onClearFilters: () => void;
}

const FilterBar = ({
  toggleFilter,
  onFilterChange,
  activeFilters,
  onClearFilters,
}: FilterBarProps) => {
  const [localFilters, setLocalFilters] = useState(activeFilters);

  const { searchQuery, setSearchQuery } = useFilter();
  const { loading, pagination } = useProperty();

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  const manageFilterUpdate = (newFilters: FilterState) => {
    setLocalFilters(newFilters);

    if (window.innerWidth >= 1024) {
      onFilterChange(newFilters);
    }
  };

  const manageInputChange = (name: string, value: string | number) => {
    const newFilters = { ...localFilters, [name]: value };
    manageFilterUpdate(newFilters);
  };

  const managePriceRangeChange = (min: number, max: number) => {
    const newFilters = { ...localFilters, minPrice: min, maxPrice: max };
    manageFilterUpdate(newFilters);
  };

  const manageAreaRangeChange = (min: number, max: number) => {
    const newFilters = { ...localFilters, minArea: min, maxArea: max };
    manageFilterUpdate(newFilters);
  };

  const manageApply = () => {
    toggleFilter();
    onFilterChange(localFilters);
  };

  const manageClear = () => {
    const resetFilters = {
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
    setLocalFilters(resetFilters);
    onClearFilters();

    if (window.innerWidth < 1024) {
      toggleFilter();
    }
  };

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "house", label: "Houses" },
    { value: "plot", label: "Plots" },
  ];

  const categoryOptions = [
    { value: "all", label: "All" },
    { value: "sale", label: "Sale" },
    { value: "rent", label: "Rent" },
  ];

  const bedroomOptions = [
    { value: 0, label: "Any" },
    { value: 1, label: "1+" },
    { value: 2, label: "2+" },
    { value: 3, label: "3+" },
    { value: 4, label: "4+" },
    { value: 5, label: "5+" },
  ];

  const bathroomOptions = [
    { value: 0, label: "Any" },
    { value: 1, label: "1+" },
    { value: 2, label: "2+" },
    { value: 3, label: "3+" },
    { value: 4, label: "4+" },
  ];

  return (
    <div className="bg-white p-4 rounded-sm shadow-md mb-10 border border-gray-200">
      <div className="flex xs:flex-col lg:flex-row lg:items-center justify-between gap-4">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <div className="flex xs:flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Type
            </label>
            <Dropdown
              options={typeOptions}
              value={localFilters.type}
              onChange={(value) => manageInputChange("type", value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Category
            </label>
            <Dropdown
              options={categoryOptions}
              value={localFilters.category}
              onChange={(value) => manageInputChange("category", value)}
              className="text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Price range
          </label>
          <div className="xs:w-60 lg:w-44 space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Rwf {localFilters.minPrice.toLocaleString()}</span>{" "}
              <span>Rwf{localFilters.maxPrice.toLocaleString()}</span>
            </div>
            <div className="flex gap-4">
              <input
                type="range"
                min="100000"
                max="200000000"
                step="1000000"
                value={localFilters.minPrice}
                onChange={(e) =>
                  managePriceRangeChange(
                    parseInt(e.target.value),
                    localFilters.maxPrice
                  )
                }
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <input
                type="range"
                min="100000"
                max="200000000"
                step="1000000"
                value={localFilters.maxPrice}
                onChange={(e) =>
                  managePriceRangeChange(
                    localFilters.minPrice,
                    parseInt(e.target.value)
                  )
                }
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Area Range
          </label>
          <div className="xs:w-60 lg:w-36 space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{localFilters.minArea.toLocaleString()} m²</span>
              <span>{localFilters.maxArea.toLocaleString()} m²</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="20000"
                step="100"
                value={localFilters.minArea}
                onChange={(e) =>
                  manageAreaRangeChange(
                    parseInt(e.target.value),
                    localFilters.maxArea
                  )
                }
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <input
                type="range"
                min="0"
                max="20000"
                step="100"
                value={localFilters.maxArea}
                onChange={(e) =>
                  manageAreaRangeChange(
                    localFilters.minArea,
                    parseInt(e.target.value)
                  )
                }
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>

        <div className="flex xs:flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Bedrooms
            </label>
            <Dropdown
              options={bedroomOptions}
              value={localFilters.bedrooms}
              onChange={(value) => manageInputChange("bedrooms", value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Bathrooms
            </label>
            <Dropdown
              options={bathroomOptions}
              value={localFilters.bathrooms}
              onChange={(value) => manageInputChange("bathrooms", value)}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4 gap-3 lg:hidden">
        <button
          onClick={manageClear}
          className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300 transition-colors duration-200 cursor-pointer"
        >
          Clear All
        </button>
        <button
          onClick={manageApply}
          className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-light-blue to-blue-800 rounded-md hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          Apply Filters
        </button>
      </div>

      <div className="flex items-center justify-between lg:px-4 py-1.5 mt-3">
        <div className="justify-self-end">
          <p
            className={`text-gray-600 text-xs ${
              loading ? "animate-pulse" : ""
            }`}
          >
            {loading
              ? "Loading properties..."
              : `${pagination.total} properties found`}
          </p>
        </div>

        <div className="hidden lg:flex justify-end">
          <button
            onClick={manageClear}
            className="text-xs font-medium text-gray-500 hover:text-black transition-colors duration-200 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 10px;
          width: 10px;
          border-radius: 50%;
          background: #3399ff;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 10px;
          width: 10px;
          border-radius: 50%;
          background: #3399ff;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default FilterBar;
