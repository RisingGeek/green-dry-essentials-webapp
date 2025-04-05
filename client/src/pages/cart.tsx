import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import Header from '@/components/Header';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';
import { useCart } from '@/lib/cartContext';
import { useABTest } from '@/lib/abTestContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Cart() {
  const { 
    cartItems, 
    cartSummary, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();
  const { config, trackImpression } = useABTest();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [, navigate] = useLocation();

  useEffect(() => {
    // Track page impression
    trackImpression('cartPage', 'default');
    
    // Set page title
    document.title = 'Your Cart - NutriNuts';
  }, []);

  const handleRemoveItem = async (cartItemId: number) => {
    await removeFromCart(cartItemId);
  };

  const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    await updateQuantity(cartItemId, quantity);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const applyPromoCode = () => {
    setPromoError('');
    if (promoCode.trim().toUpperCase() === 'NUTRILOCAL') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try NUTRILOCAL');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const calculateFinalTotal = () => {
    return promoApplied ? cartSummary.total - 100 : cartSummary.total;
  };

  return (
    <>
      <AnnouncementBar message="Free delivery on orders above ₹999 in Ghaziabad & Noida! Use code: NUTRILOCAL" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-heading text-primary mb-6">Your Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-2xl mx-auto">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-shopping-bag text-6xl"></i>
            </div>
            <h2 className="text-2xl font-medium text-primary mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link 
              href="/"
              className={cn(
                "font-button inline-block px-6 py-3 bg-primary hover:bg-primaryLight text-white transition-colors",
                config.ctaStyle.value === 'rounded' ? "rounded-full" : "rounded-md"
              )}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="hidden md:grid md:grid-cols-12 p-4 bg-neutral font-medium text-primary">
                  <div className="md:col-span-6">Product</div>
                  <div className="md:col-span-2 text-center">Price</div>
                  <div className="md:col-span-2 text-center">Quantity</div>
                  <div className="md:col-span-2 text-right">Subtotal</div>
                </div>
                
                {cartItems.map((item) => (
                  <div key={item.id} className="border-b border-neutral last:border-b-0">
                    <div className="p-4 md:grid md:grid-cols-12 gap-4 items-center">
                      {/* Product */}
                      <div className="md:col-span-6 flex items-center mb-4 md:mb-0">
                        <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0 mr-4">
                          <img 
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <Link href={`/product/${item.product.slug}`} className="font-medium text-primary hover:text-accent">
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-gray-500">{item.product.weight}</p>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="md:col-span-2 text-center md:text-center flex justify-between md:block mb-2 md:mb-0">
                        <span className="md:hidden">Price:</span>
                        <span className="font-medium">
                          ₹{item.product.salePrice || item.product.price}
                        </span>
                      </div>
                      
                      {/* Quantity */}
                      <div className="md:col-span-2 md:text-center flex justify-between md:justify-center items-center mb-2 md:mb-0">
                        <span className="md:hidden">Quantity:</span>
                        <div className="flex items-center border border-neutral rounded">
                          <button 
                            className="w-8 h-8 flex items-center justify-center text-primary hover:bg-neutral"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center text-primary">{item.quantity}</span>
                          <button 
                            className="w-8 h-8 flex items-center justify-center text-primary hover:bg-neutral"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Subtotal */}
                      <div className="md:col-span-2 md:text-right flex justify-between md:block">
                        <span className="md:hidden">Subtotal:</span>
                        <div className="flex items-center justify-end">
                          <span className="font-medium text-primary mr-4">
                            ₹{(item.product.salePrice || item.product.price) * item.quantity}
                          </span>
                          <button 
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Cart Actions */}
                <div className="p-4 flex justify-between items-center bg-neutral">
                  <Link 
                    href="/" 
                    className="text-primary hover:text-accent flex items-center"
                  >
                    <i className="fas fa-long-arrow-alt-left mr-2"></i>
                    Continue Shopping
                  </Link>
                  <button 
                    className="text-red-500 hover:text-red-600 flex items-center"
                    onClick={handleClearCart}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold font-heading text-primary mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-primary">₹{cartSummary.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium text-primary">
                      {cartSummary.delivery === 0 ? "Free" : `₹${cartSummary.delivery}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-primary">₹{cartSummary.tax}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between">
                      <span className="text-accent">Promo (NUTRILOCAL)</span>
                      <span className="font-medium text-accent">-₹100</span>
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between mb-6">
                  <span className="font-bold text-lg text-primary">Total</span>
                  <span className="font-bold text-lg text-primary">₹{calculateFinalTotal()}</span>
                </div>
                
                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-gray-600 mb-2 text-sm">Promo Code</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter promo code"
                      className="flex-grow"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    <Button
                      onClick={applyPromoCode}
                      disabled={promoApplied || !promoCode.trim()}
                      className="bg-secondary hover:bg-secondaryLight text-primary"
                    >
                      {promoApplied ? "Applied" : "Apply"}
                    </Button>
                  </div>
                  {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                  {promoApplied && <p className="text-accent text-xs mt-1">Promo code applied successfully!</p>}
                </div>
                
                {/* Checkout Button */}
                <button 
                  className={cn(
                    "w-full font-button bg-accent hover:bg-accentLight text-white py-4 font-medium transition-colors",
                    config.ctaStyle.value === 'rounded' ? "rounded-full" : "rounded-md"
                  )}
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
                
                {/* Accepted Payment Methods */}
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2">We accept:</p>
                  <div className="flex gap-2">
                    <i className="fab fa-cc-visa text-gray-600 text-2xl"></i>
                    <i className="fab fa-cc-mastercard text-gray-600 text-2xl"></i>
                    <i className="fab fa-cc-amex text-gray-600 text-2xl"></i>
                    <i className="fab fa-cc-paypal text-gray-600 text-2xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Newsletter />
      <Footer />
    </>
  );
}
