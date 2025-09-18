"use client";

import React, { useEffect, useState } from "react";
import {
  Bed,
  Bath,
  MapPin,
  Heart,
  LandPlot,
  ArrowLeft,
  CheckCircle,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header2 from "@/components/layout/Header2";
import Loader from "@/components/misc/Loader";
import Footer2 from "@/components/layout/Footer2";
import { useProperty } from "@/contexts/PropertyContext";
import { useInterest } from "@/contexts/InterestContext";
import { useAuth } from "@/contexts/AuthContext";
import InterestModal from "./InterestModal";
import { Interest } from "@/types/Interests";

interface PropertyDetailsProps {
  propertyId: string;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ propertyId }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { fetchProperty, currentProperty, error, clearError } = useProperty();
  const { createInterest, checkUserInterest } = useInterest();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const [userInterest, setUserInterest] = useState<{
    hasInterest: boolean;
    interest: Interest | null;
  } | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setIsLoading(true);
        clearError();
        await fetchProperty(propertyId);
      } catch (error) {
        console.error("Failed to load property:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    if (propertyId) {
      loadProperty();
    }
  }, [propertyId, fetchProperty, clearError]);

  // Check if user already has interest in this property
  useEffect(() => {
    const checkInterest = async () => {
      if (isAuthenticated && currentProperty) {
        try {
          const result = await checkUserInterest(propertyId);
          setUserInterest(result);
        } catch (error) {
          console.error("Failed to check user interest:", error);
        }
      }
    };

    if (currentProperty && isAuthenticated) {
      checkInterest();
    }
  }, [currentProperty, isAuthenticated, propertyId, checkUserInterest]);

  // Combine main image with room images when property loads
  useEffect(() => {
    if (currentProperty) {
      const images = [
        currentProperty.mainImage,
        ...currentProperty.roomTypeImages.map((img) => img.url),
      ];
      setAllImages(images);
      setCurrentImageIndex(0);
    }
  }, [currentProperty]);

  const handleBack = () => {
    router.push("/properties");
  };

  const placeInterest = () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    setShowInterestModal(true);
  };

  const interestSubmit = async (data: {
    userPhone: string;
    message?: string;
  }) => {
    if (!user || !currentProperty) return;

    try {
      setInterestLoading(true);

      await createInterest({
        userId: user.id,
        propertyId: propertyId,
        userPhone: data.userPhone,
        message: data.message,
      });

      setShowInterestModal(false);
      setShowSuccessMessage(true);

      // Update user interest status
      const result = await checkUserInterest(propertyId);
      setUserInterest(result);

      setTimeout(() => setShowSuccessMessage(false), 5000);
    } catch (error) {
      console.error("Failed to place interest:", error);
    } finally {
      setInterestLoading(false);
    }
  };

  if (isLoading) {
    return <Loader className="h-screen" />;
  }

  if (error) {
    return (
      <div className="overflow-x-hidden">
        <Header2 />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center mt-20">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
              <h2 className="text-xl font-bold text-red-800 mb-2">
                Error Loading Property
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    clearError();
                    fetchProperty(propertyId);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-sm hover:bg-red-700 transition-colors mr-2 cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  onClick={handleBack}
                  className="bg-neutral-200 text-black border border-gray-300 px-4 py-2 rounded-sm hover:bg-neutral-300 transition-colors cursor-pointer"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer2 />
      </div>
    );
  }

  if (!currentProperty) {
    return (
      <div className="overflow-x-hidden">
        <Header2 />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center mt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Property Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The property you are looking for does not exist or has been
              removed.
            </p>
            <button
              onClick={handleBack}
              className="bg-gradient-to-r from-light-blue to-blue-800 text-white px-6 py-3 font-medium rounded-sm hover:shadow-lg transition-colors flex items-center gap-2 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Properties
            </button>
          </div>
        </div>
        <Footer2 />
      </div>
    );
  }

  const getCurrentImageInfo = () => {
    if (currentImageIndex === 0) {
      return "Main Property Image";
    }

    const roomImageIndex = currentImageIndex - 1;
    const roomImage = currentProperty.roomTypeImages[roomImageIndex];

    if (roomImage) {
      const roomTypeLabels: { [key: string]: string } = {
        living_room: "Living Room",
        bedroom: "Bedroom",
        bathroom: "Bathroom",
        kitchen: "Kitchen",
        dining_room: "Dining Room",
        balcony: "Balcony",
        exterior: "Exterior",
        other: "Other",
      };

      const label = roomTypeLabels[roomImage.roomType] || "Other";
      return roomImage.description
        ? `${label}: ${roomImage.description}`
        : label;
    }

    return "Property Image";
  };

  return (
    <div className="overflow-x-hidden">
      <Header2 />

      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">
            Interest placed successfully! We&#39;ll contact you soon.
          </span>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto my-20 xs:px-10 lg:px-5 py-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-black hover:text-blue-800 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-sm overflow-hidden shadow-sm">
              <div className="relative">
                <Image
                  src={allImages[currentImageIndex]}
                  alt="Property image"
                  className="w-full h-96 object-cover"
                  width={800}
                  height={600}
                />

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-gradient-to-br from-neutral-500 to-neutral-900 px-3 py-1.5 text-xs text-white font-semibold rounded-full shadow-md">
                    {currentProperty.category === "rent"
                      ? "For Rent"
                      : "For Sale"}
                  </span>
                  {currentProperty.featured && (
                    <Star className="w-6 h-6 text-neutral-600 fill-yellow-400 mt-0.5" />
                  )}
                </div>

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev > 0 ? prev - 1 : allImages.length - 1
                        )
                      }
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 px-3.5 pt-2 pb-3 bg-black/70 text-white rounded-full hover:bg-black/90 transition-all cursor-pointer"
                      aria-label="Previous image"
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev < allImages.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white px-3.5 pt-2 pb-3 rounded-full hover:bg-black/90 transition-colors cursor-pointer"
                      aria-label="Next image"
                    >
                      →
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </div>

              {allImages.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-3 py-1 overflow-x-auto">
                    {allImages.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border transition-all transform ${
                          index === currentImageIndex
                            ? "border-blue-500 scale-105"
                            : "border-gray-200 hover:border-gray-300 hover:scale-105"
                        } cursor-pointer`}
                      >
                        <Image
                          src={image}
                          alt="Property thumbnail"
                          className="w-full h-full object-cover transition-opacity hover:opacity-80"
                          width={80}
                          height={80}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-600">
                      {getCurrentImageInfo()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-black mb-2">
                  {currentProperty.title}
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{currentProperty.location}</span>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    currentProperty.category === "sale"
                      ? "text-blue-600"
                      : "text-green-500"
                  }`}
                >
                  {currentProperty.category === "rent"
                    ? `Rwf ${currentProperty.price.toLocaleString()}/month`
                    : `Rwf ${currentProperty.price.toLocaleString()}`}
                </div>
              </div>

              <div className="flex flex-wrap gap-6 mb-6 py-4 rounded-lg">
                {currentProperty.type === "house" && (
                  <>
                    <div className="flex items-center text-sm">
                      <Bed className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-500">
                        {currentProperty.bedrooms} Bedrooms
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Bath className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-500">
                        {currentProperty.bathrooms} Bathrooms
                      </span>
                    </div>
                  </>
                )}
                <div className="flex items-center text-sm">
                  <LandPlot className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-gray-500">
                    {currentProperty.area.toLocaleString()} m²
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {currentProperty.description}
                </p>
              </div>

              {currentProperty.features &&
                currentProperty.features.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Features & Amenities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {currentProperty.features.map(
                        (feature: string, index: number) => (
                          <div key={index} className="flex items-center">
                            <div
                              className={`w-2 h-2 ${
                                currentProperty.category === "sale"
                                  ? "bg-blue-600"
                                  : "bg-green-500"
                              } rounded-full mr-3`}
                            ></div>
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          <div className="sticky top-24 space-y-5">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="space-y-3">
                {userInterest?.hasInterest ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-green-800 font-medium mb-1">
                      Interest Placed!
                    </p>
                    <p className="text-green-600 text-sm">
                      We&#39;ll contact you soon regarding this property.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={placeInterest}
                    className={`flex items-center justify-center w-full bg-gradient-to-r ${
                      currentProperty.category === "sale"
                        ? "from-light-blue to-blue-800 hover:from-blue-600"
                        : "from-green-500 to-green-700 hover:from-green-500"
                    } text-white p-4 rounded-lg transition-all duration-200 cursor-pointer hover:shadow-lg`}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Place Interest
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-black mb-4">
                Property Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Type:</span>
                  <span className="capitalize text-black">
                    {currentProperty.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Category:</span>
                  <span className="capitalize text-black">
                    {currentProperty.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Area:</span>
                  <span className="text-black">
                    {currentProperty.area.toLocaleString()} m²
                  </span>
                </div>
                {currentProperty.type === "house" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bedrooms:</span>
                      <span className="text-black">
                        {currentProperty.bedrooms}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bathrooms:</span>
                      <span className="text-black">
                        {currentProperty.bathrooms}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Featured:</span>
                  <span className="text-black rounded-full">
                    {currentProperty.featured ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed:</span>
                  <span className="text-black">
                    {new Date(currentProperty.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InterestModal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        onSubmit={interestSubmit}
        loading={interestLoading}
        propertyTitle={currentProperty?.title || ""}
      />

      <Footer2 />
    </div>
  );
};

export default PropertyDetails;
