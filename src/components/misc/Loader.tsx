import Image from "next/image";
import logoBlue from "../../../public/blue-logo.webp";

interface LoaderProps {
  size?: "xs" | "md";
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ className = "" }) => {
  return (
    <div className={`relative flex justify-center items-center ${className}`}>
      <div className="absolute left-1/2 xs:w-8 xs:h-8 md:w-16 md:h-16 animate-spin rounded-full border-t-2 border-r-2 border-light-blue" />
      <Image
        src={logoBlue}
        alt="Logo"
        width={50}
        height={50}
        className="absolute left-1/2 ml-2 xs:hidden md:block"
      />
    </div>
  );
};

export default Loader;
