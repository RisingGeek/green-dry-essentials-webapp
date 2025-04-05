import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Search } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  // Close suggestions when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const debounceTimeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSuggestions(data.slice(0, 5)); // Limit to 5 suggestions
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (slug: string) => {
    navigate(`/product/${slug}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  return (
    <div className="w-full relative" ref={searchRef}>
      <form onSubmit={handleSearchSubmit}>
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Search for dry fruits, nuts, seeds..." 
            className="w-full py-2 px-4 rounded-full border border-secondary bg-neutral focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowSuggestions(true)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary hover:text-accent"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-md mt-1 z-50">
          {isLoading ? (
            <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
          ) : (
            <>
              {suggestions.length > 0 ? (
                <ul>
                  {suggestions.map((item) => (
                    <li 
                      key={item.id} 
                      className="border-b border-neutral last:border-b-0 hover:bg-neutral cursor-pointer"
                      onClick={() => handleSuggestionClick(item.slug)}
                    >
                      <div className="flex items-center p-3">
                        <div className="w-10 h-10 mr-2">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div>
                          <p className="text-primary font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">₹{item.price}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                searchQuery && <div className="p-3 text-center text-sm text-gray-500">No products found</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
