import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '@/components/Header';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';
import { useCart } from '@/lib/cartContext';
import { useABTest } from '@/lib/abTestContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

const checkoutSchema = z.object({
  fullName: z.string().min(3, { message: "Full name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.enum(["ghaziabad", "noida"], { 
    message: "Please select a city" 
  }),
  pincode: z.string().regex(/^\d{6}$/, { message: "Please enter a valid 6-digit pincode" }),
  paymentMethod: z.enum(["cod", "upi", "card"], {
    message: "Please select a payment method"
  }),
  saveInfo: z.boolean().optional(),
  notes: z.string().optional()
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { cartItems, cartSummary, clearCart } = useCart();
  const { config, trackImpression, trackConversion } = useABTest();
  const { toast } = useToast();
  const [promoApplied, setPromoApplied] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "ghaziabad",
      pincode: "",
      paymentMethod: "cod",
      saveInfo: false,
      notes: ""
    }
  });

  useEffect(() => {
    // Track page impression
    trackImpression('checkoutPage', 'default');
    
    // Set page title
    document.title = 'Checkout - NutriNuts';
    
    // Check if cart is empty, redirect to cart page if it is
    if (cartItems.length === 0) {
      navigate('/cart');
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
    }
    
    // Check if promo is applied from localStorage
    const promoStatus = localStorage.getItem('promoApplied');
    if (promoStatus === 'true') {
      setPromoApplied(true);
    }
    
    // Pre-fill form if user data exists
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        form.reset({
          ...form.getValues(),
          ...parsedData
        });
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, []);

  const calculateFinalTotal = () => {
    return promoApplied ? cartSummary.total - 100 : cartSummary.total;
  };

  const onSubmit = async (data: CheckoutForm) => {
    try {
      setOrderProcessing(true);
      
      // Save user data if selected
      if (data.saveInfo) {
        localStorage.setItem('userData', JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          pincode: data.pincode
        }));
      }
      
      // Get session ID for tracking the order
      const sessionId = localStorage.getItem('sessionId') || '';
      
      // Create order
      const orderData = {
        ...data,
        cartItems: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.salePrice || item.product.price
        })),
        totalAmount: calculateFinalTotal(),
        promoApplied,
        sessionId
      };
      
      const response = await apiRequest('POST', '/api/orders', orderData);
      
      if (response.ok) {
        const orderResult = await response.json();
        
        // Track conversion
        trackConversion('checkout', 'completed');
        
        // Clear cart
        await clearCart();
        
        // Clear promo code status
        localStorage.removeItem('promoApplied');
        
        // Show success message
        toast({
          title: "Order placed successfully!",
          description: `Your order #${orderResult.orderId} has been placed.`,
        });
        
        // Redirect to success page or home
        navigate('/');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setOrderProcessing(false);
    }
  };

  return (
    <>
      <AnnouncementBar message="Free delivery on orders above ₹999 in Ghaziabad & Noida! Use code: NUTRILOCAL" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-heading text-primary mb-6">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-heading text-primary mb-4">Shipping Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="9876543210" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input placeholder="201301" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your full address" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ghaziabad" id="ghaziabad" />
                                <label htmlFor="ghaziabad" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Ghaziabad
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="noida" id="noida" />
                                <label htmlFor="noida" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Noida
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h2 className="text-xl font-bold font-heading text-primary mb-4">Payment Method</h2>
                    
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-2 border p-3 rounded-md">
                                <RadioGroupItem value="cod" id="cod" />
                                <label htmlFor="cod" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
                                  <i className="fas fa-money-bill-wave text-primary mr-2"></i>
                                  Cash on Delivery
                                </label>
                              </div>
                              <div className="flex items-center space-x-2 border p-3 rounded-md">
                                <RadioGroupItem value="upi" id="upi" />
                                <label htmlFor="upi" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
                                  <i className="fas fa-mobile-alt text-primary mr-2"></i>
                                  UPI Payment
                                </label>
                              </div>
                              <div className="flex items-center space-x-2 border p-3 rounded-md">
                                <RadioGroupItem value="card" id="card" />
                                <label htmlFor="card" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
                                  <i className="fas fa-credit-card text-primary mr-2"></i>
                                  Credit/Debit Card
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special instructions for your order" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="saveInfo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Save my information for future orders
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <button 
                    type="submit"
                    disabled={orderProcessing}
                    className={cn(
                      "w-full font-button bg-accent hover:bg-accentLight text-white py-4 font-medium transition-colors mt-6",
                      config.ctaStyle.value === 'rounded' ? "rounded-full" : "rounded-md",
                      orderProcessing && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {orderProcessing ? "Processing Order..." : "Place Order"}
                  </button>
                </form>
              </Form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold font-heading text-primary mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 mr-3">
                        <img 
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-primary font-medium">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} x ₹{item.product.salePrice || item.product.price}</p>
                      </div>
                    </div>
                    <span className="font-medium text-primary">
                      ₹{(item.product.salePrice || item.product.price) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-4">
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
              
              <div className="bg-neutral p-3 rounded-md text-sm text-gray-600">
                <p className="flex items-center">
                  <i className="fas fa-shield-alt text-accent mr-2"></i>
                  Your personal data will be used to process your order, support your experience, and for other purposes described in our privacy policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
