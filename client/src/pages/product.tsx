import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import Header from '@/components/Header';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/lib/cartContext';
import { useABTest } from '@/lib/abTestContext';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import { Product } from '@shared/schema';

export default function ProductPage() {
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { config, trackImpression, trackConversion } = useABTest();

  const { data: product, isLoading, error } = useQuery<Product & {
    categoryName?: string;
    categorySlug?: string;
    reviews?: Array<{
      id: number;
      name: string;
      rating: number;
      comment: string;
      date: string;
    }>;
    nutritionalInfo?: string;
  }>({
    queryKey: [`/api/products/${slug}`],
  });

  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: [`/api/products/related/${slug}`],
    enabled: !!product,
  });

  useEffect(() => {
    if (product) {
      document.title = `${product.name} - NutriNuts`;
      // Track product page impression
      trackImpression('productPage', product.id.toString());
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product.id, quantity);
      trackConversion('productPage', product.id.toString());
      console.log('Product added to cart successfully:', product.name);
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  if (isLoading) {
    return (
      <>
        <AnnouncementBar message="Free delivery on orders above ₹999 in Ghaziabad & Noida! Use code: NUTRILOCAL" />
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <Skeleton className="w-full h-[400px] rounded-lg" />
            </div>
            <div className="md:w-1/2">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/4 mb-6" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-3/4 mb-6" />
              <Skeleton className="h-8 w-1/3 mb-6" />
              <div className="flex gap-4 mb-6">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-40" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <AnnouncementBar message="Free delivery on orders above ₹999 in Ghaziabad & Noida! Use code: NUTRILOCAL" />
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
            <Link 
              href="/"
              className="font-button bg-primary hover:bg-primaryLight text-white px-6 py-3 rounded-md inline-block"
            >
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar message="Free delivery on orders above ₹999 in Ghaziabad & Noida! Use code: NUTRILOCAL" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="text-sm mb-6 text-gray-500">
          <Link href="/" className="hover:text-primary">Home</Link> {" / "}
          <Link href={`/category/${product.categorySlug}`} className="hover:text-primary">{product.categoryName}</Link> {" / "}
          <span className="text-primary">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="flex flex-col md:flex-row gap-8 mb-16">
          {/* Product Image */}
          <div className="md:w-1/2">
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={product.imageUrl || 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'} 
                alt={product.name} 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold font-heading text-primary mb-2">{product.name}</h1>
            
            {/* Ratings */}
            <div className="flex items-center mb-4">
              <div className="flex text-amber-400 mr-2">
                {Array.from({ length: Math.floor((product as any).ratings || 0) }).map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
                {(product as any).ratings && (product as any).ratings % 1 >= 0.5 && (
                  <i className="fas fa-star-half-alt"></i>
                )}
                {Array.from({ length: Math.floor(5 - ((product as any).ratings || 0)) }).map((_, i) => (
                  <i key={i + 5} className="far fa-star"></i>
                ))}
              </div>
              <span className="text-sm text-gray-500">({(product as any).reviewCount || 0} reviews)</span>
            </div>
            
            {/* Description */}
            <p className="text-gray-600 mb-6">{product.description}</p>
            
            {/* Price */}
            <div className="mb-6">
              {product.salePrice ? (
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-primary mr-3">₹{product.salePrice}</span>
                  <span className="text-gray-500 line-through">₹{product.price}</span>
                  <span className="ml-3 bg-accent/10 text-accent px-2 py-1 rounded text-xs">
                    Save {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-primary">₹{product.price}</span>
              )}
              <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>
            
            {/* Quantity and Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button 
                  className="px-4 py-2 text-primary hover:bg-gray-100"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-12 text-center border-0 focus:ring-0"
                />
                <button 
                  className="px-4 py-2 text-primary hover:bg-gray-100"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              <button 
                className={cn(
                  "font-button bg-primary hover:bg-primaryLight text-white py-2 px-6 flex-grow sm:flex-grow-0 transition-colors",
                  config.ctaStyle.value === 'rounded' ? "rounded-full" : "rounded-md"
                )}
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
              <button className="border border-primary text-primary hover:bg-neutral p-2 rounded-full">
                <i className="far fa-heart"></i>
              </button>
            </div>
            
            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center mb-3">
                <i className="fas fa-truck text-accent mr-2"></i>
                <span className="text-gray-600">
                  Free delivery on orders above ₹999 in {(product as any).city === 'both' ? 'Ghaziabad & Noida' : (product as any).city || 'Ghaziabad & Noida'}
                </span>
              </div>
              <div className="flex items-center mb-3">
                <i className="fas fa-box text-accent mr-2"></i>
                <span className="text-gray-600">Quantity: {product.weight}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-undo-alt text-accent mr-2"></i>
                <span className="text-gray-600">7-day replacement if damaged or spoiled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <Tabs defaultValue="details" className="mb-16">
          <TabsList className="border-b border-gray-200 w-full justify-start">
            <TabsTrigger value="details" className="text-lg">Details</TabsTrigger>
            <TabsTrigger value="nutrition" className="text-lg">Nutritional Info</TabsTrigger>
            <TabsTrigger value="reviews" className="text-lg">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="py-6">
            <div className="prose max-w-none">
              <h3>Product Details</h3>
              <p>{product.description}</p>
              <ul>
                <li><strong>Origin:</strong> {(product as any).origin || 'Premium quality'}</li>
                <li><strong>Shelf Life:</strong> {(product as any).shelfLife || '6 months from packaging'}</li>
                <li><strong>Storage:</strong> Store in a cool, dry place away from direct sunlight</li>
                <li><strong>Weight:</strong> {product.weight}</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="nutrition" className="py-6">
            <div className="prose max-w-none">
              <h3>Nutritional Information</h3>
              <p>Per 100g serving</p>
              <div className="border border-gray-200 rounded-lg p-4">
                {(product as any).nutritionalInfo ? (
                  <div dangerouslySetInnerHTML={{ __html: (product as any).nutritionalInfo.replace(/\n/g, '<br>') }} />
                ) : (
                  <p>Nutritional information not available for this product.</p>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="py-6">
            <div className="prose max-w-none">
              <h3>Customer Reviews</h3>
              <div className="flex items-center mb-4">
                <div className="flex text-amber-400 mr-2">
                  {Array.from({ length: Math.floor((product as any).ratings || 0) }).map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                  {(product as any).ratings && (product as any).ratings % 1 >= 0.5 && (
                    <i className="fas fa-star-half-alt"></i>
                  )}
                  {Array.from({ length: Math.floor(5 - ((product as any).ratings || 0)) }).map((_, i) => (
                    <i key={i + 5} className="far fa-star"></i>
                  ))}
                </div>
                <span className="text-lg font-medium">{(product as any).ratings || 0} out of 5</span>
              </div>
              
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center mr-2">
                          <span className="text-primary font-medium">{review.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{review.name}</div>
                          <div className="flex text-amber-400 text-sm">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <i key={i} className="fas fa-star"></i>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                      <div className="text-sm text-gray-500 mt-1">{new Date(review.date).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No reviews yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold font-heading text-primary mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct: any) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Newsletter />
      <Footer />
    </>
  );
}
