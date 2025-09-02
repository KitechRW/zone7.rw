import { useState } from "react";
import InterestModal from "./InterestModal";
import { Property } from "@/types/Properties";
import {
  Bath,
  Bed,
  LandPlot,
  Locate,
  LocateFixedIcon,
  LocationEdit,
  Map,
  MapPin,
  Star,
} from "lucide-react";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-105">
        <div className="relative">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-48 object-cover text-gray-400"
          />
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${
                property.category === "rent" ? "bg-green-500" : "bg-blue-500"
              }`}
            >
              {property.category === "rent" ? "For Rent" : "For Sale"}
            </span>
          </div>
          {/* {property.featured && (
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 text-xs font-semibold text-white bg-amber-500 rounded-full flex items-center">
                <Star className="w-4 h-4 mr-1" />
                Featured
              </span>
            </div>
          )} */}
        </div>

        <div className="p-5">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {property.title}
          </h3>
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.location}</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-light-blue">
              {property.category === "rent"
                ? `Rwf ${property.price.toLocaleString()}/mo`
                : `Rwf ${property.price.toLocaleString()}`}
            </span>
          </div>

          <div className="flex justify-between text-sm text-gray-600 border-t border-gray-100 pt-4">
            {property.type === "house" ? (
              <>
                <span className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  {property.bedrooms} Bedrooms
                </span>
                <span className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  {property.bathrooms} Bathrooms
                </span>
                <span className="flex items-center">
                  <LandPlot className="w-4 h-4 mr-1" />
                  {property.area} m<sup>2</sup>.
                </span>
              </>
            ) : (
              <span className="flex items-center">
                <LandPlot className="w-4 h-4 mr-1" />
                {property.area.toLocaleString()} sq ft
              </span>
            )}
          </div>

          <button className="mt-4 w-full bg-gradient-to-r from-light-blue to-blue-800 hover:shadow-blue-800/20 text-white py-2 px-4 rounded-lg transition shadow-md hover:shadow-lg cursor-pointer">
            Details
          </button>
        </div>
      </div>

      <InterestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        property={property}
      />
    </>
  );
};

export default PropertyCard;
