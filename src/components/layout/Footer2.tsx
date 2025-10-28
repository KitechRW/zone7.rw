import Image from "next/image";
import logoWhite from "../../../public/white-logo.webp";
import Link from "next/link";

const Footer2 = () => {
  return (
    <footer className="w-screen bg-gradient-to-r from-gray-800 to-black">
      <div className="max-w-7xl mx-auto xs:px-10 lg:px-5 py-10">
        <div className="flex xs:flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex flex-col">
            <Image
              src={logoWhite}
              alt="Logo"
              className="xs:w-20 md:w-24 mb-5"
            />
            <p className="text-gray-400 w-52">
              Finding your dream property made simple and reliable.
            </p>
          </div>

          <div className="w-52">
            <h3 className="text-xl text-white font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2 cursor-pointer">
              <Link href="/">
                <li className="text-gray-400 hover:text-white transition">
                  Home
                </li>
              </Link>
              <Link href="/properties">
                <li className="text-gray-400 hover:text-white transition">
                  Properties
                </li>
              </Link>
              <Link href="/about">
                <li className="text-gray-400 hover:text-white transition">
                  About Us
                </li>
              </Link>

              <Link href="/contact">
                <li className="text-gray-400 hover:text-white transition">
                  Contact
                </li>
              </Link>
            </ul>
          </div>

          <div className="w-52">
            <h3 className="text-xl text-white font-semibold mb-4">
              Contact Us
            </h3>
            <address className="not-italic text-gray-400 space-y-1">
              <p>KG Ave 123</p>
              <p>Giporoso, Kigali</p>
              <p>{process.env.NEXT_PUBLIC_EMAIL}</p>
              <p>{process.env.NEXT_PUBLIC_PHONE}</p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {process.env.NEXT_PUBLIC_COMPANY_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer2;
