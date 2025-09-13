import { useState, useEffect } from "react";
import Dropdown from "./Dropdown";

export interface FilterState {
  type: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
  minArea: number;
  maxArea: number;
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

  const managePriceRangeChange = (value: number) => {
    const newFilters = { ...localFilters, maxPrice: value };
    manageFilterUpdate(newFilters);
  };

  const manageAreaRangeChange = (value: number) => {
    const newFilters = { ...localFilters, maxArea: value };
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
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

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Max Price
          </label>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              Up to Rwf {localFilters.maxPrice.toLocaleString()}
            </div>
            <input
              type="range"
              min="100000"
              max="200000000"
              step="1000000"
              value={localFilters.maxPrice}
              onChange={(e) => managePriceRangeChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Max Area
          </label>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              Up to {localFilters.maxArea.toLocaleString()} m²
            </div>
            <input
              type="range"
              min="0"
              max="20000"
              step="100"
              value={localFilters.maxArea}
              onChange={(e) => manageAreaRangeChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

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

      <div className="flex justify-end mt-4 space-x-3 lg:hidden">
        <button
          onClick={manageClear}
          className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
        >
          Clear All
        </button>
        <button
          onClick={manageApply}
          className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-light-blue to-blue-800 rounded-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          Apply Filters
        </button>
      </div>

      <div className="hidden lg:flex justify-end mt-3">
        <button
          onClick={manageClear}
          className="px-4 py-1.5 text-xs font-medium text-gray-500 hover:text-black transition-colors duration-200 cursor-pointer"
        >
          Clear All
        </button>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #3399ff;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 14px;
          width: 14px;
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
