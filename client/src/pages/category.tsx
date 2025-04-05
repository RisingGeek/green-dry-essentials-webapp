import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Location } from '@shared/types';

export default function Category() {
  const { slug } = useParams();
  const [location, setLocation] = useState<Location | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [filters, setFilters] = useState({
    organic: false,
    premium: false,
    bestSeller: false,
    new: false
  });

  // Get the user's query params
  const [locationPath] = useLocation();
  const searchParams = new URLSearchParams(locationPath.split('?')[1] || '');
  const searchQuery = searchParams.get('q');

  // Load location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('locationPreference') as Location;
    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, []);

  // Listen for location changes
  useEffect(() => {
    const handleLocationChange = (event: CustomEvent) => {
      setLocation(event.detail.location);
    };

    window.addEventListener('locationChange', handleLocationChange as EventListener);
    return () => {
      window.removeEventListener('locationChange', handleLocationChange as EventListener);
    };
  }, []);

  // Build the query key with all filters
  const queryKey = [
    `/api/products/category/${slug}`,
    {
      location,
      sortBy,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      ...filters,
      search: searchQuery
    }
  ];

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['/api/categories', slug],
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey,
  });

  const isLoading = categoryLoading || productsLoading;

  // Set page title
  useEffect(() => {
    if (categoryData) {
      document.title = `${categoryData.name} - NutriNuts`;
    } else if (searchQuery) {
      document.title = `Search Results: ${searchQuery} - NutriNuts`;
    } else if (slug === 'all') {
      document.title = 'All Products - NutriNuts';
    } else {
      document.title = 'Category - NutriNuts';
    }
  }, [categoryData, searchQuery, slug]);

  const handleFilterChange = (key: keyof typeof filters) => {
    setFilters({
      ...filters,
      [key]: !filters[key]
    });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const clearFilters = () => {
    setFilters({
      organic: false,
      premium: false,
      bestSeller: false,
      new: false
    });
    setPriceRange([0, 2000]);
    setSortBy('featured');
  };

  return (
    <>
      <AnnouncementBar message="Free delivery on orders above ₹999 in Ghaziabad & Noida! Use code: NUTRILOCAL" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-1/3 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/4">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-40 w-full mb-6" />
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-40 w-full" />
              </div>
              <div className="md:w-3/4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={`skeleton-${index}`} className="bg-white rounded-lg overflow-hidden border border-neutral">
                      <Skeleton className="w-full h-56" />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <div className="flex justify-between items-center mt-4">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-8 w-24 rounded-md" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {searchQuery ? (
              <h1 className="text-3xl font-bold font-heading text-primary mb-2">
                Search Results: {searchQuery}
              </h1>
            ) : categoryData ? (
              <>
                <h1 className="text-3xl font-bold font-heading text-primary mb-2">
                  {categoryData.name}
                </h1>
                {categoryData.description && (
                  <p className="text-gray-600 mb-6">{categoryData.description}</p>
                )}
              </>
            ) : (
              <h1 className="text-3xl font-bold font-heading text-primary mb-2">
                All Products
              </h1>
            )}
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className="md:w-1/4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-heading text-lg font-bold text-primary">Filters</h3>
                    <button 
                      className="text-sm text-accent hover:underline"
                      onClick={clearFilters}
                    >
                      Clear All
                    </button>
                  </div>
                  
                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Price Range</h4>
                    <Slider 
                      defaultValue={[0, 2000]} 
                      min={0} 
                      max={2000} 
                      step={100}
                      value={priceRange}
                      onValueChange={handlePriceChange}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                  
                  {/* Product Types */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Product Type</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="organic" 
                          checked={filters.organic}
                          onCheckedChange={() => handleFilterChange('organic')}
                        />
                        <label htmlFor="organic" className="text-sm text-gray-600 cursor-pointer">
                          Organic
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="premium" 
                          checked={filters.premium}
                          onCheckedChange={() => handleFilterChange('premium')}
                        />
                        <label htmlFor="premium" className="text-sm text-gray-600 cursor-pointer">
                          Premium
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="bestSeller" 
                          checked={filters.bestSeller}
                          onCheckedChange={() => handleFilterChange('bestSeller')}
                        />
                        <label htmlFor="bestSeller" className="text-sm text-gray-600 cursor-pointer">
                          Best Seller
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="new" 
                          checked={filters.new}
                          onCheckedChange={() => handleFilterChange('new')}
                        />
                        <label htmlFor="new" className="text-sm text-gray-600 cursor-pointer">
                          New Arrivals
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Products Grid */}
              <div className="md:w-3/4">
                {/* Sort and Results Count */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <p className="text-gray-600 mb-2 sm:mb-0">{products.length} products found</p>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Sort by:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="featured">Featured</SelectItem>
                          <SelectItem value="priceLow">Price: Low to High</SelectItem>
                          <SelectItem value="priceHigh">Price: High to Low</SelectItem>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="topRated">Top Rated</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {products.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <div className="text-gray-400 mb-3">
                      <i className="fas fa-search text-4xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-primary mb-2">No products found</h3>
                    <p className="text-gray-600">Try adjusting your filters or search terms</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products.map((product: any) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Newsletter />
      <Footer />
    </>
  );
}
