"use client";

import Image from "next/image";
import welcomeImage from "../../public/background.webp";

interface WelcomeProps {
  scrollToProperties: () => void;
  homeRef: React.RefObject<HTMLDivElement | null>;
  onFilterUpdate: (filters: { category: string; type: string }) => void;
}

const Welcome: React.FC<WelcomeProps> = ({
  scrollToProperties,
  homeRef,
  onFilterUpdate,
}) => {
  const buyProperties = () => {
    scrollToProperties();
    setTimeout(() => {
      onFilterUpdate({ category: "sale", type: "all" });
    }, 500);
  };

  const rentHouse = () => {
    scrollToProperties();
    setTimeout(() => {
      onFilterUpdate({ category: "rent", type: "house" });
    }, 500);
  };

  return (
    <section ref={homeRef} className="relative h-[750px] py-5">
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <Image
        src={welcomeImage}
        alt="Welcome"
        className="w-full h-full object-cover"
        fill
        priority
        quality={85}
        placeholder="blur"
        sizes="100vw"
      />

      <div className="h-full flex flex-col items-center justify-center relative z-10">
        <div className="flex flex-col items-center text-white max-w-2xl text-center px-5 gap-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Find The Property
            <br />
            Of Your Dreams
            <br />
            in Rwanda
          </h1>
          <p className=" lg:text-xl px-4">
            Browse the perfect home, plot, or investment opportunity with our
            selection of premium real estate.
          </p>
        </div>

        <div className="absolute xs:bottom-5 md:bottom-24 flex xs:flex-col md:flex-row items-center xs:gap-5 md:gap-10">
          <button
            onClick={buyProperties}
            className="xs:w-68 md:w-40 bg-gradient-to-r from-light-blue to-blue-800 text-white px-6 py-4 rounded-sm font-semibold transition-all duration-500 cursor-pointer"
          >
            Buy Properties
          </button>
          <button
            onClick={rentHouse}
            className="xs:w-68 md:w-40 bg-gradient-to-r from-green-400 to-green-700 text-white px-6 py-4 rounded-sm font-semibold transition-all duration-500 cursor-pointer"
          >
            Rent a House
          </button>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
