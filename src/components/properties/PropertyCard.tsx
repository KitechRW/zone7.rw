import { Property } from "@/types/Properties";
import { Bed, LandPlot, MapPin, Toilet } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const router = useRouter();

  const viewDetails = () => {
    router.push(`/properties/${property.id}`);
  };

  return (
    <div
      onClick={viewDetails}
      className="relative w-full h-96 rounded-xl shadow-lg overflow-hidden hover:shadow-xl cursor-pointer group"
    >
      <div className="relative h-full overflow-hidden">
        <Image
          src={property.mainImage}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 "
          width={400}
          height={208}
        />
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1.5 text-xs font-semibold text-white rounded-full shadow-md ${
              property.category === "rent"
                ? "bg-gradient-to-b from-green-500 to-green-800"
                : "bg-gradient-to-b from-blue-500 to-blue-900"
            }`}
          >
            {property.category === "rent" ? "For Rent" : "For Sale"}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent transition-all duration-300" />
      </div>

      <div className="absolute bottom-1 w-full p-4 flex flex-col">
        <div>
          <h3 className="font-bold text-lg text-gray-200 mb-2 line-clamp-2">
            {property.title}
          </h3>

          <div className="flex items-center text-gray-200 mb-4">
            <MapPin className="w-4 h-4 mr-2 text-gray-200" />
            <span className="text-sm truncate">{property.location}</span>
          </div>

          <div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-200">
                Rwf {property.price.toLocaleString()}
                {property.category === "rent" && (
                  <span className="text-sm font-medium text-gray-200">/mo</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-300">
            {property.type === "house" ? (
              <>
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1 text-gray-300" />
                  <span>{property.bedrooms} beds</span>
                </div>
                <div className="flex items-center">
                  <Toilet className="w-4 h-4 mr-1 text-gray-300" />
                  <span>{property.bathrooms} baths</span>
                </div>
                <div className="flex items-center">
                  <LandPlot className="w-4 h-4 mr-1 text-gray-300" />
                  <span>{property.area} m²</span>
                </div>
              </>
            ) : (
              <div className="flex items-center">
                <LandPlot className="w-4 h-4 mr-2 text-gray-400" />
                <span>{property.area.toLocaleString()} m² land</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
