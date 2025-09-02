import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import logoWhite from "../../public/white-logo.webp";
import logoblue from "../../public/blue-logo.webp";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
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
    <header className="fixed mx-auto inset-x-0 max-w-[2000px] top-0 z-50">
      {scrolled ? (
        <div className="relative flex items-center justify-between xs:px-5 md:px-10 py-1 bg-white shadow-md">
          <div>
            <Link href="/" className="text-3xl font-bold text-light-blue">
              <Image src={logoblue} alt="Logo" className="w-32" />
            </Link>
          </div>

          <nav className="hidden md:flex gap-8">
            <Link
              href="/"
              className="text-gray-900 hover:text-cyan-600 transition"
            >
              Home
            </Link>
            <Link
              href="/properties"
              className="text-gray-900 hover:text-cyan-600 transition"
            >
              Properties
            </Link>
            <Link
              href="/about"
              className="text-gray-900 hover:text-cyan-600 transition"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-900 hover:text-cyan-600 transition"
            >
              Contact
            </Link>
          </nav>

          <button
            className="md:hidden focus:outline-none cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6 text-black" />
          </button>
        </div>
      ) : (
        <div className="relative flex items-center justify-between xs:px-5 md:px-10 py-1 bg-transparent backdrop-blur-sm">
          <div>
            <Link href="/" className="text-3xl font-bold text-white">
              <Image src={logoWhite} alt="Logo" className="w-32" />
            </Link>
          </div>

          <nav className="hidden md:flex gap-8">
            <Link
              href="/"
              className="text-white hover:text-cyan-300 transition"
            >
              Home
            </Link>
            <Link
              href="/properties"
              className="text-white hover:text-cyan-300 transition"
            >
              Properties
            </Link>
            <Link
              href="/about"
              className="text-white hover:text-cyan-300 transition"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-cyan-300 transition"
            >
              Contact
            </Link>
          </nav>

          <button
            className="md:hidden focus:outline-none cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {isMenuOpen && (
        <div className="absolute right-0 md:hidden bg-platinum py-4 px-4 shadow-lg w-48">
          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              className="text-gray-900 hover:text-cyan-600 transition"
            >
              Home
            </Link>
            <Link
              href="/properties"
              className="text-gray-900 hover:text-cyan-600 transition"
            >
              Properties
            </Link>
            <Link
              href="/about"
              className="text-gray-900 hover:text-cyan-600 transition"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-900 hover:text-cyan-600 transition"
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
