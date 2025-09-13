"use client";

import Image from "next/image";
import welcomeImage from "../../../public/background.webp";
import { useFilter } from "@/contexts/FilterContext";
import { useRouter } from "next/navigation";

interface WelcomeProps {
  homeRef: React.RefObject<HTMLDivElement | null>;
}

const Welcome: React.FC<WelcomeProps> = ({ homeRef }) => {
  const { updateFilters } = useFilter();

  const router = useRouter();

  const buyProperties = () => {
    router.push("/properties");
    setTimeout(() => {
      updateFilters({ category: "sale", type: "all" });
    }, 500);
  };

  const rentHouse = () => {
    router.push("/properties");
    setTimeout(() => {
      updateFilters({ category: "rent", type: "house" });
    }, 500);
  };

  return (
    <section ref={homeRef} className="relative w-screen h-[750px] mx-auto py-5">
      <div>
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <Image
          src={welcomeImage}
          alt="Welcome"
          className="w-full h-full object-cover"
          fill
          priority
          placeholder="blur"
          sizes="100vw"
        />
      </div>

      <div className="h-full flex flex-col items-center justify-center relative z-10">
        <div className="flex flex-col items-center text-white max-w-2xl text-center px-5 gap-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Live The Dream
            <br />
            With Your Property
          </h1>
          <p className=" lg:text-xl px-4">
            Find the perfect home, plot, or investment opportunity with our
            available collection of real estate in Rwanda.
          </p>
        </div>

        <div className="absolute xs:bottom-5 md:bottom-24 flex xs:flex-col md:flex-row items-center xs:gap-5 md:gap-10">
          <button
            onClick={buyProperties}
            className="xs:w-68 md:w-40 bg-gradient-to-r from-light-blue to-blue-800 hover:shadow-lg text-white px-6 py-4 rounded-sm font-semibold truncate transition-all duration-500 cursor-pointer"
          >
            Buy Properties
          </button>
          <button
            onClick={rentHouse}
            className="xs:w-68 md:w-40 bg-gradient-to-r from-green-400 to-green-700  hover:shadow-lg text-white px-6 py-4 rounded-sm font-semibold truncate transition-all duration-500 cursor-pointer"
          >
            Rent a House
          </button>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
