import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Whatsapp = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 90) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return (): void => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Link href={`https://wa.me/${process.env.NEXT_PUBLIC_PHONE}`}>
      <div className="group">
        <div
          className={`flex items-center justify-end fixed xs:bottom-2 md:bottom-5 xs:right-2 md:right-5 rounded-full xs:p-2 md:p-3 z-50 ${
            isScrolled ? "bg-[#25d366]" : "bg-white/10 backdrop-blur-sm"
          } animate-bounce [animation-duration:5s] group-hover:pl-5 transition-all duration-500 ease-in-out`}
        >
          <p className="text-white md:text-lg mr-2 hidden group-hover:inline-block whitespace-nowrap">
            Chat with Us
          </p>
          <Image
            src="/whatsapp.svg"
            alt="whatsapp"
            width={50}
            height={50}
            className="xs:w-6 md:w-8 xs:h-6 md:h-8 invert"
          />
        </div>
      </div>
    </Link>
  );
};

export default Whatsapp;
