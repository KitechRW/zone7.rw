import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  return (
    <div className="relative xs:w-full lg:w-80">
      <div className="absolute inset-y-0 left-0 mx-3 mt-0.5 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-gray-500" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="block w-full h-12 text-sm pl-10 border-2 border-gray-300 rounded-lg leading-5 focus:border-light-blue bg-white placeholder-neutral-400 focus:outline-none text-black"
        placeholder="Search..."
      />
    </div>
  );
};

export default SearchBar;
