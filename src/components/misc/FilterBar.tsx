import { useState, useEffect } from "react";

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

  const handleInputChange = (name: string, value: string | number) => {
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);
  };

  const handlePriceChange = (min: number, max: number) => {
    const newFilters = { ...localFilters, minPrice: min, maxPrice: max };
    setLocalFilters(newFilters);
  };

  const handleAreaChange = (min: number, max: number) => {
    const newFilters = { ...localFilters, minArea: min, maxArea: max };
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    toggleFilter();
    onFilterChange(localFilters);
  };

  const handleClear = () => {
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
    toggleFilter();
  };

  return (
    <div className="bg-white p-6 rounded-sm shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Property Type</h3>
          <div className="space-y-2">
            {["all", "house", "plot"].map((type) => (
              <div key={type} className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="property-type"
                    checked={localFilters.type === type}
                    onChange={() => handleInputChange(`type`, type)}
                    className="hidden"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 ${
                      localFilters.type === type
                        ? "border-light-blue bg-light-blue"
                        : "border-gray-300"
                    }`}
                  >
                    {localFilters.type === type && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 capitalize">
                    {type === "all" ? "All Types" : type + "s"}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-3">Category</h3>
          <div className="space-y-2">
            {["all", "sale", "rent"].map((category) => (
              <div key={category} className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="property-category"
                    checked={localFilters.category === category}
                    onChange={() => handleInputChange("category", category)}
                    className="hidden"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 ${
                      localFilters.category === category
                        ? "border-light-blue bg-light-blue"
                        : "border-gray-300"
                    }`}
                  >
                    {localFilters.category === category && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 capitalize">
                    {category === "all"
                      ? "All Categories"
                      : category === "sale"
                      ? "For Sale"
                      : "For Rent"}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-3">Price Range</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">
                Rwf {localFilters.minPrice.toLocaleString()} - Rwf{" "}
                {localFilters.maxPrice.toLocaleString()}
              </label>
              <div className="relative pt-1">
                <div className="flex gap-2 mt-2">
                  <input
                    type="range"
                    min="100000"
                    max="200000000"
                    step="100000"
                    value={localFilters.minPrice}
                    onChange={(e) =>
                      handlePriceChange(
                        parseInt(e.target.value),
                        localFilters.maxPrice
                      )
                    }
                    className="w-full h-2 bg-blue-100 rounded-sm appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="100000"
                    max="200000000"
                    step="100000"
                    value={localFilters.maxPrice}
                    onChange={(e) =>
                      handlePriceChange(
                        localFilters.minPrice,
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-blue-100 rounded-sm appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-3">Rooms</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Bedrooms
              </label>
              <select
                value={localFilters.bedrooms}
                onChange={(e) =>
                  handleInputChange("bedrooms", parseInt(e.target.value))
                }
                className="w-full p-2 border border-gray-300 rounded-sm text-sm text-black"
              >
                <option value={0}>Any</option>
                <option value={1}>1+</option>
                <option value={2}>2+</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
                <option value={5}>5+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Bathrooms
              </label>
              <select
                value={localFilters.bathrooms}
                onChange={(e) =>
                  handleInputChange("bathrooms", parseInt(e.target.value))
                }
                className="w-full p-2 border border-gray-300 rounded-sm text-sm text-black"
              >
                <option value={0}>Any</option>
                <option value={1}>1+</option>
                <option value={2}>2+</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs text-gray-600 mb-1">
              Area (sq ft)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.minArea === 0 ? "" : localFilters.minArea}
                onChange={(e) =>
                  handleAreaChange(
                    parseInt(e.target.value) || 0,
                    localFilters.maxArea
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-sm text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black"
              />
              <input
                type="number"
                placeholder="Max"
                value={
                  localFilters.maxArea === 20000 ? "" : localFilters.maxArea
                }
                onChange={(e) =>
                  handleAreaChange(
                    localFilters.minArea,
                    parseInt(e.target.value) || 20000
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-sm text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6 space-x-4">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-sm hover:bg-gray-300 transition cursor-pointer"
        >
          Clear All
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 text-sm font-medium text-white bg-light-blue rounded-sm shadow-2xl hover:shadow-neutral-500 transition cursor-pointer"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
