import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { useABTest } from '@/lib/abTestContext';
import { cn } from '@/lib/utils';

interface CartSidebarProps {
  isVisible: boolean;
}

export function CartSidebar({ isVisible }: CartSidebarProps) {
  const { 
    cartItems, 
    cartSummary,
    closeCart, 
    removeFromCart, 
    updateQuantity, 
    getCartCount 
  } = useCart();
  
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [location] = useLocation();
  const { config } = useABTest();

  // Close the cart when the route changes
  useEffect(() => {
    closeCart();
  }, [location]);

  // Prevent scrolling when the cart is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  const applyPromoCode = () => {
    if (promoCode.trim() === 'NUTRILOCAL') {
      setPromoApplied(true);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white overflow-y-auto transform transition-transform">
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-heading text-xl font-bold text-primary">Your Cart ({getCartCount()})</h3>
            <button className="text-primary text-xl" onClick={closeCart}>
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-3">
                  <i className="fas fa-shopping-bag text-4xl"></i>
                </div>
                <p className="text-gray-600 mb-4">Your cart is empty</p>
                <button 
                  onClick={closeCart}
                  className={cn(
                    "font-button bg-primary hover:bg-primaryLight text-white px-5 py-2 transition-colors",
                    config.ctaStyle.value === 'rounded' ? "rounded-full" : "rounded-md"
                  )}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex border-b border-neutral pb-4">
                  <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0 mr-3">
                    <img 
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-primary">{item.product.name}</h4>
                    <p className="text-xs text-gray-500">{item.product.weight}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border border-neutral rounded">
                        <button 
                          className="w-8 h-8 flex items-center justify-center text-primary hover:bg-neutral"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-primary">{item.quantity}</span>
                        <button 
                          className="w-8 h-8 flex items-center justify-center text-primary hover:bg-neutral"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-medium text-primary">
                        ₹{(item.product.salePrice || item.product.price) * item.quantity}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="ml-2 text-gray-400 hover:text-primary self-start"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))
            )}
          </div>
          
          {cartItems.length > 0 && (
            <>
              {/* Cart Summary */}
              <div className="bg-neutral p-4 rounded">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-primary">₹{cartSummary.subtotal}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium text-primary">
                    {cartSummary.delivery === 0 ? "Free" : `₹${cartSummary.delivery}`}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-primary">₹{cartSummary.tax}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between mb-2">
                    <span className="text-accent">Promo (NUTRILOCAL)</span>
                    <span className="font-medium text-accent">-₹100</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-secondary">
                  <span className="font-bold text-primary">Total</span>
                  <span className="font-bold text-primary">
                    ₹{promoApplied ? cartSummary.total - 100 : cartSummary.total}
                  </span>
                </div>
              </div>
              
              {/* Promo Code */}
              <div className="mt-6 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Promo code" 
                  className="flex-grow px-4 py-2 rounded border border-neutral focus:outline-none focus:border-secondary"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                />
                <button 
                  className="bg-secondary hover:bg-secondaryLight text-primary px-4 py-2 rounded font-medium transition-colors"
                  onClick={applyPromoCode}
                  disabled={promoApplied}
                >
                  {promoApplied ? "Applied" : "Apply"}
                </button>
              </div>
              
              {/* Checkout Buttons */}
              <div className="mt-6 space-y-3">
                <Link 
                  href="/checkout"
                  className={cn(
                    "block w-full text-center font-button bg-accent hover:bg-accentLight text-white py-3 font-medium transition-colors",
                    config.ctaStyle.value === 'rounded' ? "rounded-full" : "rounded-md"
                  )}
                >
                  Proceed to Checkout
                </Link>
                <button 
                  className="w-full font-button bg-white hover:bg-neutral text-primary py-3 rounded-full font-medium border border-primary transition-colors"
                  onClick={closeCart}
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartSidebar;
