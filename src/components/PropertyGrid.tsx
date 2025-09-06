import PropertyCard from "./PropertyCard";
import { Property } from "../types/Properties";
import { motion } from "framer-motion";

interface PropertyGridProps {
  properties: Property[];
}

const PropertyGrid = ({ properties }: PropertyGridProps) => {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700">
          No properties found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      viewport={{ once: true }}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
        gap: "2.5rem",
      }}
    >
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </motion.div>
  );
};

export default PropertyGrid;
