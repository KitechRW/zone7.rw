import PropertyDetails from "@/components/PropertyDetails";

interface PropertyPageProps {
  params: {
    id: string;
  };
}

const PropertyPage = ({ params }: PropertyPageProps) => {
  return <PropertyDetails propertyId={params.id} />;
};

export default PropertyPage;
