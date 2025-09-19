"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/misc/Avatar";
import { useAuth } from "../../contexts/AuthContext";
import { useProperty } from "../../contexts/PropertyContext";
import logoblue from "../../../public/blue-logo.webp";
import { Interest } from "@/types/Interests";
import { Property } from "@/types/Properties";
import {
  Trash2,
  MapPin,
  Home,
  Calendar,
  Phone,
  MessageCircle,
  X,
  Bed,
  Bath,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Footer2 from "@/components/layout/Footer2";

interface InterestedProperty {
  interest: Interest;
  property: Property | null;
}

const ProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { fetchProperty } = useProperty();
  const router = useRouter();

  const [interestedProperties, setInterestedProperties] = useState<
    InterestedProperty[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInterests = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/interests/user");

        if (!response.ok) {
          throw new Error("Failed to fetch interests");
        }

        const result = await response.json();
        const interests: Interest[] = result.data?.interests || [];

        // Fetch property details for each interest
        const interestedPropsData = await Promise.all(
          interests.map(async (interest) => {
            try {
              const property = await fetchProperty(interest.propertyId);
              return { interest, property };
            } catch (err) {
              console.error(
                `Failed to fetch property ${interest.propertyId}:`,
                err
              );
              return { interest, property: null };
            }
          })
        );

        setInterestedProperties(interestedPropsData);
      } catch (err) {
        console.error("Error fetching user interests:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load your interests"
        );
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserInterests();
    }
  }, [user?.id, isAuthenticated, fetchProperty]);

  const deleteAccount = async () => {
    if (!user?.id) return;

    try {
      setDeleting(true);

      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete account");
      }

      await logout();
      router.push("/");
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const removeInterest = async (interestId: string) => {
    try {
      const response = await fetch(`/api/interests/${interestId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove interest");
      }

      setInterestedProperties((prev) =>
        prev.filter((item) => item.interest.id !== interestId)
      );
    } catch (err) {
      console.error("Error removing interest:", err);
      setError(
        err instanceof Error ? err.message : "Failed to remove interest"
      );
    }
  };

  const formatPrice = (price: number) => {
    return `Rwf ${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto xs:px-10 lg:px-5 mb-20">
        <div className="shadow rounded-sm mb-8">
          <div className="p-5">
            <Link href="/">
              <Image src={logoblue} alt="Logo" className="w-20" priority />
            </Link>
          </div>
        </div>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 rounded-sm p-4 mb-6">
            <div className="flex">
              <p className="text-red-800 truncate">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  Your Interested Properties ({interestedProperties.length})
                </h2>
              </div>

              <div className="p-5">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="animate-pulse">
                        <div className="flex space-x-4">
                          <div className="bg-gray-300 rounded-sm w-24 h-20"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : interestedProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Properties Yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      You haven&#39;t shown interest in any properties yet.
                    </p>
                    <button
                      onClick={() => router.push("/properties")}
                      className="bg-black text-white px-4 py-2.5 rounded-sm hover:shadow-lg cursor-pointer"
                    >
                      Browse Properties
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interestedProperties.map(({ interest, property }) => (
                      <div
                        key={interest.id}
                        className="border border-gray-200 rounded-sm p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex xs:flex-col md:flex-row gap-8">
                          <div className="flex-shrink-0">
                            {property?.mainImage ? (
                              <Image
                                src={property.mainImage}
                                alt={property.title}
                                width={96}
                                height={64}
                                className="rounded-sm object-cover"
                              />
                            ) : (
                              <div className="w-24 h-20 bg-gray-200 rounded-sm flex items-center justify-center">
                                <Home className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                  {property?.title || "Property Unavailable"}
                                </h3>
                                {property && (
                                  <>
                                    <div className="flex items-center text-gray-600 mb-3">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      <span className="text-sm">
                                        {property.location}
                                      </span>
                                    </div>
                                    <p className="flex text-blue-900 font-medium mb-1">
                                      {formatPrice(property.price)}
                                    </p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      {property.bedrooms && (
                                        <span className="flex items-center gap-1">
                                          {property.bedrooms}
                                          <Bed className="w-4 h-4 text-gray-600" />
                                        </span>
                                      )}
                                      {property.bathrooms && (
                                        <span className="flex items-center gap-1">
                                          {property.bathrooms}
                                          <Bath className="w-4 h-4 text-gray-600" />
                                        </span>
                                      )}
                                      <span>{property.area} m²</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex flex-col items-center gap-4">
                                  <span className="flex items-center">
                                    <Phone className="w-4 h-4 mr-1" />
                                    {interest.userPhone}
                                  </span>
                                  <span className="flex items-center -ml-4">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {formatDate(interest.createdAt)}
                                  </span>
                                </div>
                              </div>
                              {interest.message && (
                                <div className="mt-3 flex items-start">
                                  <MessageCircle className="w-4 h-4 mr-1 mt-0.5 text-gray-400" />
                                  <p className="text-sm text-gray-600 italic">
                                    &#34;{interest.message}&#34;
                                  </p>
                                </div>
                              )}
                            </div>

                            {property && (
                              <div className="mt-3">
                                <button
                                  onClick={() =>
                                    router.push(`/properties/${property.id}`)
                                  }
                                  className="text-light-blue hover:text-blue-600 text-sm font-medium cursor-pointer"
                                >
                                  View Property
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => removeInterest(interest.id)}
                              className="text-red-700 hover:text-red-800 text-sm my-2 cursor-pointer"
                              title="Remove interest"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow rounded-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Account Information
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {user && <Avatar userName={user?.email} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-gray-900 capitalize">
                      {user?.username?.split("_")[0] || "User"}
                    </h1>
                    <p className="text-gray-600 text-sm">{user?.email}</p>
                  </div>
                </div>
                <div className="ml-12">
                  <label className="block font-bold text-gray-900 mb-1">
                    Account Type
                  </label>
                  <p className="text-gray-600 text-sm capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Account Actions
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => logout}
                  className="w-full bg-black text-white py-2.5 px-4 rounded-sm transition-colors cursor-pointer"
                >
                  Logout
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-red-700 text-white py-2.5 px-4 rounded-sm hover:bg-red-800 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-sm max-w-sm w-full px-10 py-5">
              <h3 className="text-center font-bold text-gray-900 mb-4">
                Delete Account?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to delete your account? This action cannot
                be undone and will:
              </p>
              <ul className="list-disc list-inside text-gray-600 text-sm mb-8 space-y-1">
                <li>Permanently delete your account</li>
                <li>Remove all your property interests</li>
                <li>Delete your personal information</li>
              </ul>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-neutral-200 text-gray-900 py-2 px-4 rounded-sm hover:bg-neutral-300 transition-colors cursor-pointer"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAccount}
                  disabled={deleting}
                  className="flex-1 bg-red-700 text-white py-2 px-4 rounded-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {deleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer2 />
    </section>
  );
};

export default ProfilePage;
