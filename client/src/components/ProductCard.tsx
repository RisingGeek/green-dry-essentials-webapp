import { useState } from 'react';
import { Link } from 'wouter';
import { Heart } from 'lucide-react';
import { Product } from '@shared/schema';
import { useCart } from '@/lib/cartContext';
import { useABTest } from '@/lib/abTestContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { config, trackConversion } = useABTest();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToCart(product.id, 1);
      
      // Track conversion for the product card style
      trackConversion('productCardStyle', config.productCardStyle.value);
      
      console.log('Product added to cart:', product.id);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const renderBadge = () => {
    if (product.isNew) return <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded-full">New</span>;
    if (product.isBestSeller) return <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded-full">Best Seller</span>;
    if (product.isOrganic) return <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">Organic</span>;
    if (product.isPremium) return <span className="absolute top-2 left-2 bg-secondary text-primary text-xs px-2 py-1 rounded-full">Premium</span>;
    return null;
  };

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="product-card bg-white rounded-lg overflow-hidden border border-neutral transition-all h-full flex flex-col">
        <div className="relative">
          <img 
            src={product.imageUrl || 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-56 object-cover"
          />
          {renderBadge()}
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-lg text-primary">{product.name}</h3>
            <button 
              className="text-primary hover:text-accent" 
              onClick={toggleWishlist}
            >
              <Heart className={cn("h-5 w-5", isWishlisted ? "fill-accent text-accent" : "")} />
            </button>
          </div>
          <div className="flex items-center mb-2">
            <div className="flex text-amber-400">
              {Array.from({ length: Math.floor(product.ratings || 0) }).map((_, i) => (
                <i key={i} className="fas fa-star"></i>
              ))}
              {product.ratings && product.ratings % 1 >= 0.5 && (
                <i className="fas fa-star-half-alt"></i>
              )}
              {product.ratings && product.ratings % 1 < 0.5 && product.ratings % 1 > 0 && (
                <i className="far fa-star"></i>
              )}
              {Array.from({ length: Math.floor(5 - (product.ratings || 0)) }).map((_, i) => (
                <i key={i + 5} className="far fa-star"></i>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
          </div>
          <p className="text-sm text-gray-600 mb-3 flex-grow">
            {product.description && product.description.length > 75 
              ? `${product.description.substring(0, 75)}...` 
              : product.description || 'Premium quality dry fruit, rich in nutrients and delicious taste.'}
          </p>
          <div className="flex justify-between items-center mt-auto">
            <div>
              <span className="font-bold text-primary text-lg">₹{product.salePrice || product.price}</span>
              {product.salePrice && (
                <span className="text-gray-500 text-sm line-through ml-2">₹{product.price}</span>
              )}
            </div>
            <button 
              className={cn(
                "font-button bg-primary hover:bg-primaryLight text-white px-3 py-1 text-sm transition-colors",
                config.ctaStyle.value === 'rounded' ? "rounded-full" : "rounded-md"
              )}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
