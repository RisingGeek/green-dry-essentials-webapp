import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItemWithProduct, CartSummary } from '@shared/types';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from './queryClient';

interface CartContextType {
  cartItems: CartItemWithProduct[];
  cartSummary: CartSummary;
  isCartOpen: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  closeCart: () => void;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartSummary: { subtotal: 0, delivery: 0, tax: 0, total: 0 },
  isCartOpen: false,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  toggleCart: () => {},
  closeCart: () => {},
  getCartCount: () => 0
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    subtotal: 0,
    delivery: 0,
    tax: 0,
    total: 0
  });
  const { toast } = useToast();

  // Get session ID or create one
  const getSessionId = (): string => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('sessionId', sessionId);
      console.log('New session created:', sessionId);
    }
    return sessionId;
  };

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Calculate cart summary whenever cart items change
  useEffect(() => {
    calculateCartSummary();
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      const sessionId = getSessionId();
      console.log('Fetching cart for session:', sessionId);
      
      const response = await apiRequest('GET', `/api/cart?sessionId=${sessionId}`, undefined);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Cart data received:', data);
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // Silent failure - don't show toast for fetch failures
      setCartItems([]);
    }
  };

  const calculateCartSummary = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    
    // Calculate delivery fee (free above ₹999)
    const delivery = subtotal >= 999 ? 0 : 49;
    
    // 5% tax
    const tax = Math.round(subtotal * 0.05);
    
    setCartSummary({
      subtotal,
      delivery,
      tax,
      total: subtotal + delivery + tax
    });
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      const sessionId = getSessionId();
      const response = await apiRequest('POST', '/api/cart/add', {
        productId,
        quantity,
        sessionId
      });
      
      if (response.ok) {
        await fetchCart();
        toast({
          title: "Added to cart",
          description: "Item has been added to your cart",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      const response = await apiRequest('DELETE', `/api/cart/item/${cartItemId}`, {});
      
      if (response.ok) {
        await fetchCart();
        toast({
          title: "Removed from cart",
          description: "Item has been removed from your cart",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      if (quantity < 1) return;
      
      const response = await apiRequest('PATCH', `/api/cart/item/${cartItemId}`, {
        quantity
      });
      
      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
    }
  };

  const clearCart = async () => {
    try {
      const sessionId = getSessionId();
      const response = await apiRequest('DELETE', `/api/cart?sessionId=${sessionId}`, {});
      
      if (response.ok) {
        setCartItems([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive"
      });
    }
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartSummary,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleCart,
      closeCart,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
