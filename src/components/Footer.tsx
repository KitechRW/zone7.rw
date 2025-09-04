import Image from "next/image";
import logoWhite from "../../public/white-logo.webp";

interface FooterProps {
  scrollToHome: () => void;
}

const Footer: React.FC<FooterProps> = ({ scrollToHome }) => {
  return (
    <footer className="bg-gradient-to-r from-black to-blue-950 text-white xs:px-5 md:px-16 py-12">
      <div className="mx-auto">
        <div className="flex xs:flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex flex-col">
            <Image src={logoWhite} alt="Logo" className="w-32 mb-5" />
            <p className="text-gray-400 w-52">
              Finding your dream property made simple and reliable.
            </p>
          </div>

          <div className="w-52">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 cursor-pointer">
              <li
                onClick={scrollToHome}
                className="text-gray-400 hover:text-white transition"
              >
                Home
              </li>
              <li className="text-gray-400 hover:text-white transition">
                Properties
              </li>{" "}
              <li className="text-gray-400 hover:text-white transition">
                About Us
              </li>
              <li className="text-gray-400 hover:text-white transition">
                Contact
              </li>
            </ul>
          </div>

          <div className="w-52">
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <address className="not-italic text-gray-400">
              <p>KG 123 st</p>
              <p>Somewhere in Kigali</p>
              <p className="mt-2">info@realestate.com</p>
              <p>+250 788 123 456</p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Real Estate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
