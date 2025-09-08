import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import logoWhite from "../../public/white-logo.webp";
import logoblue from "../../public/blue-logo.webp";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface HeaderProps {
  scrollToProperties: () => void;
  scrollToHome: () => void;
}

const Header: React.FC<HeaderProps> = ({
  scrollToProperties,
  scrollToHome,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();

  const login = () => {
    router.push("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return (): void => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="fixed mx-auto inset-x-0 max-w-[1600px] top-0 z-50">
      {scrolled ? (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: scrolled ? 0 : -100, opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative flex items-center justify-between xs:px-10 md:px-20 py-1 bg-white/85 backdrop-blur-md shadow-md h-20"
        >
          <div>
            <Link href="/">
              <Image src={logoblue} alt="Logo" className="xs:w-24 md:w-32" />
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <h2
              onClick={scrollToHome}
              className="text-black font-medium hover:text-cyan-600 transition cursor-pointer"
            >
              Home
            </h2>
            <h2
              onClick={scrollToProperties}
              className="text-black font-medium hover:text-cyan-600 transition cursor-pointer"
            >
              Properties
            </h2>
            <button
              onClick={login}
              className="bg-gradient-to-r from-light-blue to-blue-800 font-medium px-4 pb-2 pt-1 rounded-sm shadow-2xl hover:shadow-blue-600 transition cursor-pointer"
            >
              Login
            </button>
          </nav>
          <button
            className="md:hidden focus:outline-none cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-black" />
            ) : (
              <Menu className="w-6 h-6 text-black" />
            )}
          </button>
        </motion.div>
      ) : (
        <div className="relative flex items-center justify-between xs:px-10 md:px-20 py-1 bg-transparent backdrop-blur-[4px] h-20">
          <div>
            <Link href="/" className="text-3xl font-bold text-white">
              <Image src={logoWhite} alt="Logo" className="xs:w-24 md:w-32" />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <h2
              onClick={scrollToProperties}
              className="text-white font-medium hover:text-cyan-400 transition cursor-pointer"
            >
              Properties
            </h2>
            <button
              onClick={login}
              className="bg-white text-black font-medium px-4 pb-2 pt-1 rounded-sm shadow-2xl hover:shadow-white/50 transition cursor-pointer"
            >
              Login
            </button>
          </nav>
          <button
            className="md:hidden focus:outline-none cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      )}

      {isMenuOpen &&
        (scrolled ? (
          <div className="absolute right-0 md:hidden bg-platinum/80 backdrop-blur-sm py-4 px-4 shadow-lg rounded-bl-md w-48">
            <nav className="flex flex-col gap-3">
              <h2
                onClick={scrollToHome}
                className="text-black font-medium hover:text-cyan-600 transition cursor-pointer"
              >
                Home
              </h2>
              <h2
                onClick={scrollToProperties}
                className="text-black font-medium hover:text-cyan-600 transition cursor-pointer"
              >
                Properties
              </h2>
              <button
                onClick={login}
                className="bg-gradient-to-r from-light-blue to-blue-800 font-medium px-4 pb-2 pt-1 rounded-sm shadow-2xl hover:shadow-blue-600 transition cursor-pointer"
              >
                Login
              </button>
            </nav>
          </div>
        ) : (
          <div className="absolute right-0 md:hidden bg-white/5 backdrop-blur-2xl py-4 px-4 shadow-xl rounded-bl-md w-48">
            <nav className="flex flex-col gap-3">
              <h2 className="text-white font-medium hover:text-cyan-300 transition cursor-pointer">
                Home
              </h2>
              <h2
                onClick={scrollToProperties}
                className="text-white font-medium hover:text-cyan-300 transition cursor-pointer"
              >
                Properties
              </h2>
              <button
                onClick={login}
                className="bg-white text-black font-medium px-4 pb-2 pt-1 rounded-sm shadow-2xl hover:shadow-white/20 transition cursor-pointer"
              >
                Login
              </button>
            </nav>
          </div>
        ))}
    </header>
  );
};

export default Header;
