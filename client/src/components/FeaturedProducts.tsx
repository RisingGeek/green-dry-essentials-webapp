import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products/featured'],
  });
  
  return (
    <section id="featured-products" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-heading text-3xl font-bold text-primary">Featured Products</h2>
          <Link href="/category/all" className="text-accent hover:underline font-medium">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: 4 }).map((_, index) => (
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
            ))
          ) : (
            products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
