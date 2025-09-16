import { RefObject, useEffect, useState } from "react";
import { useProperty } from "@/contexts/PropertyContext";
import { Property } from "@/types/Properties";
import PropertyGrid from "@/components/properties/PropertyGrid";
import Link from "next/link";

interface ListingsProps {
  propertyRef: RefObject<HTMLDivElement | null>;
}

const PropertyListings: React.FC<ListingsProps> = ({ propertyRef }) => {
  const { fetchFeaturedProperties } = useProperty();

  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const properties = await fetchFeaturedProperties(6);
        setFeaturedProperties(properties);
      } catch (error) {
        console.error("Failed to load featured properties:", error);
        setError("Failed to load properties. Please try again.");
        setFeaturedProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedProperties();
  }, [fetchFeaturedProperties]);

  const handleRetry = () => {
    const loadFeaturedProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const properties = await fetchFeaturedProperties(6);
        setFeaturedProperties(properties);
      } catch (error) {
        console.error("Failed to load featured properties:", error);
        setError("Failed to load properties. Please try again.");
        setFeaturedProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedProperties();
  };

  return (
    <section className="max-w-7xl mx-auto px-5 py-10">
      <div ref={propertyRef} className="mb-12">
        <h2 className="xs:text-4xl md:text-5xl lg:text-6xl text-center font-bold">
          <span className="bg-gradient-to-r from-blue-800 to-black bg-clip-text text-transparent">
            Featured Properties
          </span>
        </h2>

        <p className="text-black md:text-lg lg:text-xl text-center mt-5 mb-16 font-medium">
          Discover our handpicked selection of premium properties for sale and
          rent.
        </p>

        {/* Loading State */}
        {isLoading && (
          <div className="grid xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="relative bg-gray-300 w-full h-96 rounded-xl animate-pulse"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-400 to-transparent rounded-xl"></div>
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  <div className="h-4 bg-neutral-400 rounded animate-pulse"></div>
                  <div className="h-3 bg-neutral-400 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-neutral-400 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Unable to load properties
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-red-600 text-white px-4 py-2 rounded-sm hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Success State - Show Properties */}
        {!isLoading && !error && featuredProperties.length > 0 && (
          <PropertyGrid properties={featuredProperties} />
        )}

        {/* Empty State */}
        {!isLoading && !error && featuredProperties.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No Featured Properties
              </h3>
              <p className="text-gray-600 mb-4">
                There are currently no featured properties available. Check back
                soon!
              </p>
            </div>
          </div>
        )}

        {/* View All Properties Link */}
        {!isLoading && featuredProperties.length > 0 && (
          <div className="flex justify-center self-center w-full my-8">
            <Link
              href="/properties"
              className="flex justify-center xs:w-full md:w-60 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-neutral-400 rounded-sm py-3 text-gray-700 hover:text-black hover:shadow-md transition-all duration-200"
            >
              <p className="xs:text-sm md:text-base font-medium">
                View all properties
              </p>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertyListings;
