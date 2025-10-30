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
    <div className="bg-white p-4 rounded-sm shadow-md mb-5 border border-gray-200">
      <div className="flex xs:flex-col lg:flex-row items-center justify-between gap-5">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <div className="flex gap-4">
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

        <div className="flex gap-4">
          <div className="-mt-2">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Price range (Rwf)
            </label>
            <div className="max-w-36">
              <div className="text-xs text-gray-600 mb-1">
                {localFilters.minPrice.toLocaleString()} -{" "}
                {localFilters.maxPrice.toLocaleString()}
              </div>
              <div className="flex">
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
                  className="w-16 h-0.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
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
                  className="w-16 h-0.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          <div className="-mt-2">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Area Range (m²)
            </label>
            <div className="max-w-24 space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                {localFilters.minArea.toLocaleString()} -{" "}
                {localFilters.maxArea.toLocaleString()}
              </div>
              <div className="flex items-center">
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
                  className="w-14 h-0.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
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
                  className="w-14 h-0.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
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

      <div className="flex items-center justify-between py-1.5 mt-4">
        <p
          className={`pl-2 text-gray-600 xs:text-[10px] md:text-xs ${
            loading ? "animate-pulse" : ""
          }`}
        >
          {loading
            ? "Loading properties..."
            : `${pagination.total} properties found`}
        </p>

        <div className="flex justify-end xs:gap-2 md:gap-4">
          <button
            onClick={manageClear}
            className="px-4 py-2 xs:text-[10px] md:text-xs font-medium text-gray-700 bg-gray-100 rounded-sm hover:bg-gray-200 border border-gray-300 transition-colors duration-200 truncate cursor-pointer"
          >
            Clear All
          </button>
          <button
            onClick={manageApply}
            className="px-4 py-2 xs:text-[10px] md:text-xs font-medium text-white bg-black rounded-sm hover:shadow-lg transition-all duration-200 truncate cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 8px;
          width: 8px;
          border-radius: 50%;
          background: #3399ff;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 8px;
          width: 8px;
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
