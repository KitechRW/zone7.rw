import Loader from "@/components/misc/Loader";
import PropertyDetails from "@/components/properties/PropertyDetails";
import { Suspense } from "react";

interface PropertyPageProps {
  params: {
    id: string;
  };
}

const PropertyPage = async ({ params }: PropertyPageProps) => {
  const { id } = await params;
  return (
    <Suspense fallback={<Loader />}>
      <PropertyDetails propertyId={id} />
    </Suspense>
  );
};

export default PropertyPage;
