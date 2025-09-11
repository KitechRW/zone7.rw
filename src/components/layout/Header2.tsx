import Image from "next/image";
import Link from "next/link";
import logoblue from "../../../public/blue-logo.webp";
import { useRouter } from "next/navigation";
import Avatar from "../misc/Avatar";
import { useAuth } from "@/contexts/AuthContext";

const Header2 = () => {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  const login = () => {
    router.push("/auth");
  };

  return (
    <header className="fixed mx-auto inset-x-0 max-w-[1600px] top-0 z-50">
      <div className="relative flex items-center justify-between xs:px-10 md:px-20 py-1 bg-white/85 backdrop-blur-md shadow-md h-20">
        <div>
          <Link href="/">
            <Image src={logoblue} alt="Logo" className="xs:w-24 md:w-32" />
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {user ? (
            <div className="group">
              <button className="flex items-center justify-center overflow-hidden rounded-full xs:w-0 md:w-8">
                <Avatar userName={user.email} />
              </button>
              <div className="absolute right-20 z-50 items-center hidden px-2 py-4 bg-platinum/90 rounded-md shadow-lg group-justify-center group-hover:block backdrop-blur-sm">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Link href="/profile">
                    <p className="px-2 py-1 text-sm text-gray-700 truncate hover:text-cyan-600">
                      My account
                    </p>
                  </Link>
                  <button
                    onClick={logout}
                    className="w-20 px-2 pt-1 pb-2 text-sm text-white font-medium bg-red-600 rounded hover:bg-red-700 cursor-pointer"
                  >
                    {authLoading ? (
                      <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent border-b-transparent border-l-transparent animate-spin justify-self-center" />
                    ) : (
                      "Logout"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={login}
              className="bg-gradient-to-r from-light-blue to-blue-800 font-medium px-4 pb-2 pt-1 rounded-sm shadow-2xl hover:shadow-blue-600 transition cursor-pointer"
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header2;
