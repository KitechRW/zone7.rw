"use client";

import React, { useEffect, useState } from "react";
import { Bed, Bath, MapPin, Heart, Calendar, LandPlot } from "lucide-react";
import { useRouter } from "next/navigation";
import { mockPropertyDetails } from "@/util/TempDetails";
import Image from "next/image";
import Header2 from "../layout/Header2";
import Loader from "../misc/Loader";
import Footer2 from "../layout/Footer2";

interface PropertyDetailsProps {
  propertyId: string;
}

// Mock detailed property data
const getPropertyDetails = (id: string) => {
  return mockPropertyDetails.find((property) => property.id === id) || null;
};

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ propertyId }) => {
  const router = useRouter();
  const property = getPropertyDetails(propertyId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleBack = () => {
    router.push("/");
  };

  const [isLoading, SetIsLoading] = useState<boolean>(true);
  useEffect(() => {
    setTimeout(() => {
      SetIsLoading(false);
    }, 1000);
  }, []);

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Property Not Found
          </h2>
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-light-blue to-blue-800 text-white px-6 py-2 rounded-sm hover:shadow-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return isLoading ? (
    <Loader className="h-screen" />
  ) : (
    <div className="overflow-x-hidden">
      <Header2 />

      <div className="max-w-7xl mx-auto mt-20 px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-sm overflow-hidden shadow-sm">
              <div className="relative">
                <Image
                  src={property.images[currentImageIndex]}
                  alt="Property image"
                  className="w-full h-96 object-cover"
                  width={300}
                  height={200}
                />
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 pt-1 pb-1.5 text-sm font-semibold text-white rounded-full ${
                      property.category === "rent"
                        ? "bg-green-500"
                        : "bg-blue-600"
                    }`}
                  >
                    {property.category === "rent" ? "For Rent" : "For Sale"}
                  </span>
                </div>

                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev > 0 ? prev - 1 : property.images.length - 1
                        )
                      }
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 px-3.5 pt-2 pb-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all cursor-pointer"
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev < property.images.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white px-3.5 pt-2 pb-3 rounded-full hover:bg-black/70 transition-colors cursor-pointer"
                    >
                      →
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </div>

              <div className="p-4">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {property.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-blue-500"
                          : "border-gray-200 hover:border-gray-300"
                      } cursor-pointer`}
                    >
                      <Image
                        src={image}
                        alt="Property rooms"
                        className="w-full h-full object-cover"
                        width={300}
                        height={200}
                      />
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm text-gray-600">
                    {property.roomTypes
                      ? property.roomTypes[currentImageIndex]
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-black mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{property.location}</span>
                </div>
                <div
                  className={`text-3xl font-bold ${
                    property.category === "sale"
                      ? "text-light-blue"
                      : "text-green-500"
                  }`}
                >
                  {property.category === "rent"
                    ? `Rwf ${property.price.toLocaleString()}/month`
                    : `Rwf ${property.price.toLocaleString()}`}
                </div>
              </div>

              <div className="flex flex-wrap gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                {property.type === "house" ? (
                  <>
                    <div className="flex items-center">
                      <Bed className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="text-gray-500">
                        {property.bedrooms} Bedrooms
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="text-gray-500">
                        {property.bathrooms} Bathrooms
                      </span>
                    </div>
                  </>
                ) : null}
                <div className="flex items-center">
                  <LandPlot className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-500">
                    {property.area.toLocaleString()} m²
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {property.description}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Features & Amenities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property.features
                    ? property.features.map(
                        (feature: string, index: number) => (
                          <div key={index} className="flex items-center">
                            <div
                              className={`w-2 h-2 ${
                                property.category === "sale"
                                  ? "bg-light-blue"
                                  : "bg-green-500"
                              } rounded-full mr-3`}
                            ></div>
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        )
                      )
                    : ""}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="sticky top-24 bg-white rounded-lg p-6 shadow-sm">
              <div className="space-y-3">
                <button
                  className={`flex items-center justify-center w-full bg-gradient-to-r ${
                    property.category === "sale"
                      ? "from-light-blue to-blue-800"
                      : "bg-gradient-to-r from-green-500 to-green-700"
                  } text-white py-3 px-4 rounded-lg transition-colors cursor-pointer`}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Place interest
                </button>
                <button
                  className={`flex items-center justify-center w-full border bg-light-blue/5 ${
                    property.category === "sale"
                      ? "border-light-blue text-blue-800 "
                      : "border-green-500 text-green-900 hover:bg-green-500/10"
                  } py-3 px-4 rounded-lg  transition-colors cursor-pointer`}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Visit
                </button>
              </div>
            </div>

            <div className="sticky top-68 bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibled text-black mb-4">
                Property Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Type:</span>
                  <span className="capitalize text-gray-500">
                    {property.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Category:</span>
                  <span className="capitalize text-gray-500">
                    {property.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Area:</span>
                  <span className="text-gray-500">
                    {property.area.toLocaleString()} m²
                  </span>
                </div>
                {property.type === "house" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bedrooms:</span>
                      <span className="text-gray-500">{property.bedrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bathrooms:</span>
                      <span className="text-gray-500">
                        {property.bathrooms}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer2 />
    </div>
  );
};

export default PropertyDetails;
