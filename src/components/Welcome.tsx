import Image from "next/image";
import welcomeImage from "../../public/house-keys.png";

const Welcome = () => {
  return (
    <section className="relative h-[730px] py-5">
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <Image
        src={welcomeImage}
        alt="Welcome"
        className="w-full h-full object-cover"
        fill
      />

      <div className="h-full flex flex-col items-center justify-center relative z-10">
        <div className="flex flex-col items-center text-white max-w-2xl text-center px-5 gap-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Find The Property
            <br />
            Of Your Dreams
          </h1>
          <p className="text-xl px-4">
            Browse the perfect home, plot, or investment opportunity with our
            selection of premium real estate.
          </p>
        </div>

        <button className="absolute bottom-24 bg-gradient-to-r from-light-blue to-blue-800 hover:px-10 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-500 cursor-pointer">
          Browse Properties
        </button>
      </div>
    </section>
  );
};

export default Welcome;
