"use client";

import { RefObject } from "react";
import { useFilter } from "@/contexts/FilterContext";
import PropertyGrid from "../properties/PropertyGrid";
import Link from "next/link";

interface ListingsProps {
  propertyRef: RefObject<HTMLDivElement | null>;
}

const PropertyListings: React.FC<ListingsProps> = ({ propertyRef }) => {
  const { filteredProperties, isLoading } = useFilter();

  return (
    <>
      <section className="max-w-7xl mx-auto px-5 py-10">
        <div ref={propertyRef} className="mb-12">
          <h2 className="xs:text-4xl md:text-5xl lg:text-6xl text-center font-bold">
            <span className="bg-gradient-to-r from-light-blue to-blue-800 bg-clip-text text-transparent">
              Property Listings
            </span>
          </h2>

          <p className="text-black md:text-lg lg:text-xl text-center mt-5 mb-16 font-medium">
            Own or rent a property from our available listings.
          </p>

          {isLoading ? (
            <div className="grid xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-start">
              <div className="relative bg-neutral-300 w-full h-96 rounded-xl animate-pulse"></div>
              <div className="relative bg-neutral-300 w-full h-96 rounded-xl animate-pulse"></div>
              <div className="relative bg-neutral-300 w-full h-96 rounded-xl animate-pulse"></div>
            </div>
          ) : (
            <PropertyGrid properties={filteredProperties.slice(0, 6)} />
          )}

          <div className="flex justify-center self-center w-full my-6">
            <Link
              href="/properties"
              className="flex justify-center xs:w-full md:w-60 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-neutral-400 rounded-sm py-3 text-gray-700  hover:text-black hover:shadow-md transition-all duration-200"
            >
              <p className="xs:text-sm md:text-base font-medium">
                View all properties
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default PropertyListings;
