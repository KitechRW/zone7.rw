import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  return (
    <div className="relative w-96 max-w-[500px]">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-5 h-5 text-gray-500" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="block w-full pl-10 pr-3 py-5 border-2 border-gray-300 rounded-lg leading-5 focus:border-light-blue bg-white placeholder-neutral-400 focus:outline-none text-black"
        placeholder="Search by location, property type..."
      />
    </div>
  );
};

export default SearchBar;
