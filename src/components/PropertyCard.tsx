import { useState } from "react";
import InterestModal from "./InterestModal";
import { Property } from "@/types/Properties";
import { Bed, LandPlot, MapPin, Toilet } from "lucide-react";
import Image from "next/image";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="justify-self-center bg-platinum w-60 h-80 rounded-sm shadow-2xl overflow-hidden transition-all duration-500 shadow-black/10 hover:shadow-cyan-800/20 cursor-pointer">
        <div className="relative">
          <Image
            src={property.image}
            alt={property.title}
            className="h-44 object-cover text-gray-400"
            width={250}
            height={100}
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
        </div>

        <div className="px-2 py-3 text-center">
          <h3 className="font-semibold text-sm text-black mb-3 truncate">
            {property.title}
          </h3>
          <div className="flex items-center justify-center text-gray-500 mb-3">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="text-xs">{property.location}</span>
          </div>

          <div className="mb-2">
            <span
              className={`font-bold ${
                property.category === "rent"
                  ? "text-green-500"
                  : "text-light-blue"
              }`}
            >
              {property.category === "rent"
                ? `Rwf ${property.price.toLocaleString()}/mo`
                : `Rwf ${property.price.toLocaleString()}`}
            </span>
          </div>

          <div className="flex justify-center gap-6 text-xs text-gray-500 py-2">
            {property.type === "house" ? (
              <>
                <span className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  {property.bedrooms}
                </span>
                <span className="flex items-center">
                  <Toilet className="w-4 h-4 mr-1" />
                  {property.bathrooms}
                </span>
                <span className="flex items-center">
                  <LandPlot className="w-4 h-4 mr-1" />
                  {property.area} m<sup>2</sup>
                </span>
              </>
            ) : (
              <span className="flex items-center">
                <LandPlot className="w-4 h-4 mr-1" />
                {property.area.toLocaleString()} m<sup>2</sup>.
              </span>
            )}
          </div>

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
