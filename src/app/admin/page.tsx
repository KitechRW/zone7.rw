"use client";

import PropertyModal from "@/components/properties/PropertyModal";
import { Property } from "@/types/Properties";
import { mockProperties } from "@/util/TempData";
import {
  Edit,
  Trash2,
  Eye,
  Building2,
  MapPin,
  Bed,
  Bath,
  LandPlot,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useFilter } from "@/contexts/FilterContext";
import Header2 from "@/components/layout/Header2";
import SearchBar from "@/components/misc/SearchBar";
import Loader from "@/components/misc/Loader";

const AdminDashboard = () => {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [isLoading, SetIsLoading] = useState(true);

  const { searchQuery, setSearchQuery, activeFilters, updateFilters } =
    useFilter();

  useEffect(() => {
    setTimeout(() => {
      SetIsLoading(false);
    }, 1000);
  }, []);

  const stats = {
    totalProperties: properties.length,
    totalSales: properties.filter((p) => p.category === "sale").length,
    totalRentals: properties.filter((p) => p.category === "rent").length,
    featuredProperties: properties.filter((p) => p.featured).length,
    totalValue: properties.reduce((sum, p) => sum + p.price, 0),
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      activeFilters.type === "all" || property.type === activeFilters.type;

    const matchesCategory =
      activeFilters.category === "all" ||
      property.category === activeFilters.category;

    return matchesSearch && matchesType && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const openModal = (mode: "create" | "edit" | "view", property?: Property) => {
    setModalMode(mode);
    setSelectedProperty(property || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProperty(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      setProperties(properties.filter((p) => p.id !== id));
    }
  };

  const handleSubmit = (propertyData: Partial<Property>) => {
    if (modalMode === "create") {
      const newProperty: Property = {
        ...propertyData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      } as Property;
      setProperties([...properties, newProperty]);
    } else if (modalMode === "edit" && selectedProperty) {
      setProperties(
        properties.map((p) =>
          p.id === selectedProperty.id
            ? {
                ...p,
                ...propertyData,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : p
        )
      );
    }
    closeModal();
  };

  const handleTypeChange = (type: "all" | "house" | "plot") => {
    updateFilters({ type });
  };

  const handleCategoryChange = (category: "all" | "sale" | "rent") => {
    updateFilters({ category });
  };

  return isLoading ? (
    <Loader className="h-screen" />
  ) : (
    <div className="min-h-screen">
      <Header2 />
      <div className="mt-20 bg-platinum max-w-[1600px] mx-auto py-8 xs:px-10 md:px-20">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))",
            gap: "1.25rem",
            marginBottom: "2rem",
          }}
        >
          <div className="group bg-white hover:bg-blue-50 rounded-sm shadow-sm p-6">
            <div className="flex items-center justify-between group-hover:-translate-x-2 transition-all duration-500">
              <div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-blue-800">
                  Total Properties
                </p>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-900">
                  {stats.totalProperties}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white hover:bg-green-50 rounded-sm shadow-sm p-6">
            <div className="flex items-center justify-between group-hover:-translate-x-2 transition-all duration-500">
              <div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-green-800">
                  For Sale
                </p>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-green-900">
                  {stats.totalSales}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white hover:bg-blue-50 rounded-sm shadow-sm p-6">
            <div className="flex items-center justify-between group-hover:-translate-x-2 transition-all duration-500">
              <div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-blue-800">
                  For Rent
                </p>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-900">
                  {stats.totalRentals}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white hover:bg-green-50 rounded-sm shadow-sm p-6">
            <div className="flex items-center justify-between group-hover:-translate-x-2 transition-all duration-500">
              <div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-green-800">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-green-900">
                  {formatPrice(stats.totalValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 rounded-sm shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />

              <div className="flex gap-2">
                <select
                  value={activeFilters.type}
                  onChange={(e) =>
                    handleTypeChange(e.target.value as "all" | "house" | "plot")
                  }
                  className="block w-full px-3 py-4 border-2 border-gray-300 rounded-sm leading-5 focus:border-light-blue bg-white placeholder-neutral-400 focus:outline-none text-gray-700 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="house">Houses</option>
                  <option value="plot">Plots</option>
                </select>

                <select
                  value={activeFilters.category}
                  onChange={(e) =>
                    handleCategoryChange(
                      e.target.value as "all" | "sale" | "rent"
                    )
                  }
                  className="block w-full px-3 py-4 border-2 border-gray-300 rounded-sm leading-5 focus:border-light-blue bg-white placeholder-neutral-400 focus:outline-none text-gray-700 text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => openModal("create")}
          className="bg-gradient-to-r from-light-blue to-blue-800 text-white font-medium px-4 py-3 my-8 rounded-sm hover:shadow-lg transition-colors flex items-center gap-2 cursor-pointer"
        >
          Add Property
        </button>

        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Properties
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Image
                          className="h-12 w-12 rounded-sm object-cover"
                          src={property.image}
                          alt={property.title}
                          width={100}
                          height={100}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {property.title}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {property.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-gray-100 text-gray-800">
                          {property.type}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium ${
                            property.category === "sale"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {property.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-950">
                      <div className="flex flex-col gap-1 rounded-sm p-2">
                        <div className="flex items-center gap-2">
                          <LandPlot className="h-3 w-3" />
                          {property.area} m²
                        </div>
                        {property.type === "house" && (
                          <div className="flex items-center gap-2">
                            <Bed className="h-3 w-3" />
                            {property.bedrooms} bed
                            <Bath className="h-3 w-3 ml-2" />
                            {property.bathrooms} bath
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-800">
                        {formatPrice(property.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal("view", property)}
                          className="text-gray-400 hover:text-blue-900"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal("edit", property)}
                          className="text-light-blue hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="text-red-500 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No properties found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ||
                activeFilters.type !== "all" ||
                activeFilters.category !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating a new property"}
              </p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <PropertyModal
          mode={modalMode}
          property={selectedProperty}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
