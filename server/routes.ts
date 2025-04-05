import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCategorySchema, 
  insertProductSchema, 
  insertCartItemSchema, 
  insertOrderSchema, 
  insertOrderItemSchema,
  insertABTestSchema,
  insertABTestResultSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // Test route to verify API is working
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
  });

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  app.get('/api/categories/:slug', async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch category' });
    }
  });

  // Products
  app.get('/api/products/featured', async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch featured products' });
    }
  });

  app.get('/api/products/bestsellers', async (req, res) => {
    try {
      const products = await storage.getBestSellerProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch bestseller products' });
    }
  });

  app.get('/api/products/category/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const location = req.query.location as string || 'both';
      const sortBy = req.query.sortBy as string || 'featured';
      const minPrice = Number(req.query.minPrice) || 0;
      const maxPrice = Number(req.query.maxPrice) || 10000;
      const filters = {
        organic: req.query.organic === 'true',
        premium: req.query.premium === 'true',
        bestSeller: req.query.bestSeller === 'true',
        new: req.query.new === 'true'
      };
      const search = req.query.search as string || '';

      let products;
      if (slug === 'all') {
        products = await storage.getAllProducts();
      } else {
        products = await storage.getProductsByCategory(slug);
      }

      // Apply filters
      let filteredProducts = products.filter(product => {
        const price = product.salePrice || product.price;
        const matchesPrice = price >= minPrice && price <= maxPrice;
        const matchesLocation = location === 'both' || product.city === 'both' || product.city === location;
        
        // Check other filters only if they are selected
        const matchesOrganic = !filters.organic || product.isOrganic;
        const matchesPremium = !filters.premium || product.isPremium;
        const matchesBestSeller = !filters.bestSeller || product.isBestSeller;
        const matchesNew = !filters.new || product.isNew;
        
        // Check search term if provided
        const matchesSearch = !search || 
          product.name.toLowerCase().includes(search.toLowerCase()) || 
          product.description.toLowerCase().includes(search.toLowerCase());
        
        return matchesPrice && matchesLocation && matchesOrganic && 
               matchesPremium && matchesBestSeller && matchesNew && matchesSearch;
      });

      // Apply sorting
      switch (sortBy) {
        case 'priceLow':
          filteredProducts.sort((a, b) => {
            const priceA = a.salePrice || a.price;
            const priceB = b.salePrice || b.price;
            return priceA - priceB;
          });
          break;
        case 'priceHigh':
          filteredProducts.sort((a, b) => {
            const priceA = a.salePrice || a.price;
            const priceB = b.salePrice || b.price;
            return priceB - priceA;
          });
          break;
        case 'newest':
          // Assuming newer products have isNew flag
          filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        case 'topRated':
          filteredProducts.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
          break;
        case 'featured':
        default:
          // For featured, prioritize products marked as featured
          filteredProducts.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }

      res.json(filteredProducts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  });

  app.get('/api/products/search', async (req, res) => {
    try {
      const query = req.query.q as string || '';
      if (!query) {
        return res.json([]);
      }

      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to search products' });
    }
  });

  app.get('/api/products/:slug', async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Get the category name for the product
      const category = await storage.getCategory(product.categoryId);
      const productWithCategory = {
        ...product,
        categoryName: category ? category.name : '',
        categorySlug: category ? category.slug : ''
      };

      res.json(productWithCategory);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch product' });
    }
  });

  app.get('/api/products/related/:slug', async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const relatedProducts = await storage.getRelatedProducts(product.id, product.categoryId);
      res.json(relatedProducts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch related products' });
    }
  });

  // Cart
  app.get('/api/cart', async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
      }

      const cartItems = await storage.getCartItems(sessionId);
      res.json({ items: cartItems });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch cart' });
    }
  });

  app.post('/api/cart/add', async (req, res) => {
    try {
      const cartItemSchema = insertCartItemSchema.extend({
        sessionId: z.string().min(1),
        productId: z.number().int().positive(),
        quantity: z.number().int().positive()
      });

      const validatedData = cartItemSchema.parse(req.body);
      
      // Check if product exists
      const product = await storage.getProduct(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if the item is already in the cart
      const existingItem = await storage.getCartItemByProductAndSession(
        validatedData.productId, 
        validatedData.sessionId
      );

      let cartItem;
      if (existingItem) {
        // Update quantity if already in cart
        cartItem = await storage.updateCartItemQuantity(
          existingItem.id, 
          existingItem.quantity + validatedData.quantity
        );
      } else {
        // Add new item to cart
        cartItem = await storage.addToCart(validatedData);
      }

      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to add item to cart' });
    }
  });

  app.patch('/api/cart/item/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid cart item ID' });
      }

      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be at least 1' });
      }

      const cartItem = await storage.updateCartItemQuantity(id, quantity);
      if (!cartItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }

      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update cart item' });
    }
  });

  app.delete('/api/cart/item/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid cart item ID' });
      }

      await storage.removeFromCart(id);
      res.json({ message: 'Item removed from cart' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to remove item from cart' });
    }
  });

  app.delete('/api/cart', async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
      }

      await storage.clearCart(sessionId);
      res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to clear cart' });
    }
  });

  // Orders
  app.post('/api/orders', async (req, res) => {
    try {
      const orderSchema = z.object({
        fullName: z.string().min(3),
        email: z.string().email(),
        phone: z.string().min(10),
        address: z.string().min(5),
        city: z.enum(["ghaziabad", "noida"]),
        pincode: z.string().regex(/^\d{6}$/),
        paymentMethod: z.enum(["cod", "upi", "card"]),
        notes: z.string().optional(),
        cartItems: z.array(z.object({
          productId: z.number().int().positive(),
          quantity: z.number().int().positive(),
          price: z.number().positive()
        })),
        totalAmount: z.number().positive(),
        promoApplied: z.boolean().optional(),
        sessionId: z.string()
      });

      const validatedData = orderSchema.parse(req.body);
      
      // Check if all products exist and are in stock
      for (const item of validatedData.cartItems) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(404).json({ 
            message: `Product with ID ${item.productId} not found` 
          });
        }
        
        if (product.quantity < item.quantity) {
          return res.status(400).json({ 
            message: `Not enough stock for ${product.name}. Available: ${product.quantity}` 
          });
        }
      }

      // Create order
      const orderData = {
        status: 'pending',
        totalAmount: validatedData.totalAmount,
        shippingAddress: validatedData.address,
        shippingCity: validatedData.city,
        shippingPincode: validatedData.pincode,
        paymentMethod: validatedData.paymentMethod
      };

      const order = await storage.createOrder(orderData);
      
      // Create order items
      for (const item of validatedData.cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });
        
        // Update product quantity
        const product = await storage.getProduct(item.productId);
        if (product) {
          await storage.updateProductQuantity(
            item.productId, 
            product.quantity - item.quantity
          );
        }
      }
      
      // Clear the cart
      await storage.clearCart(validatedData.sessionId);
      
      res.status(201).json({ 
        message: 'Order created successfully', 
        orderId: order.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create order' });
    }
  });

  // A/B Testing
  app.post('/api/ab-test/impression', async (req, res) => {
    try {
      const { testName, variant, sessionId } = req.body;
      
      if (!testName || !variant || !sessionId) {
        return res.status(400).json({ 
          message: 'testName, variant, and sessionId are required' 
        });
      }
      
      // Get or create A/B test
      let test = await storage.getABTestByName(testName);
      if (!test) {
        test = await storage.createABTest({
          testName,
          variants: JSON.stringify([variant]),
          isActive: true
        });
      }
      
      // Record impression
      await storage.recordABTestImpression(test.id, variant, sessionId);
      
      res.status(200).json({ message: 'Impression recorded' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to record impression' });
    }
  });

  app.post('/api/ab-test/conversion', async (req, res) => {
    try {
      const { testName, variant, sessionId } = req.body;
      
      if (!testName || !variant || !sessionId) {
        return res.status(400).json({ 
          message: 'testName, variant, and sessionId are required' 
        });
      }
      
      // Get or create A/B test
      let test = await storage.getABTestByName(testName);
      if (!test) {
        return res.status(404).json({ message: 'A/B test not found' });
      }
      
      // Record conversion
      await storage.recordABTestConversion(test.id, variant, sessionId);
      
      res.status(200).json({ message: 'Conversion recorded' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to record conversion' });
    }
  });

  // Newsletter subscription
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      // Check if email already subscribed
      const existingSubscription = await storage.getNewsletterSubscription(email);
      if (existingSubscription) {
        return res.status(200).json({ 
          message: 'Email already subscribed', 
          alreadySubscribed: true 
        });
      }
      
      // Add new subscription
      await storage.addNewsletterSubscription(email);
      
      res.status(201).json({ message: 'Subscription successful' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to subscribe to newsletter' });
    }
  });

  // Home page data
  app.get('/api/home', async (req, res) => {
    try {
      // Hero slides
      const slides = [
        {
          id: 1,
          imageUrl: "https://images.unsplash.com/photo-1563591854-89da2ae3c004?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
          title: "Premium Dry Fruits Delivered to Your Doorstep",
          description: "Farm-fresh nuts and dry fruits for Ghaziabad & Noida",
          ctaText: "Shop Now",
          ctaLink: "#featured-products"
        },
        {
          id: 2,
          imageUrl: "https://images.unsplash.com/photo-1596542211615-2c194f3a2902?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
          title: "Organic & Natural Dry Fruits",
          description: "100% natural and chemical-free dry fruits",
          ctaText: "Explore Organic",
          ctaLink: "/category/organic"
        },
        {
          id: 3,
          imageUrl: "https://images.unsplash.com/photo-1522897333681-78815c11e761?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
          title: "Gift Boxes for Every Occasion",
          description: "Premium gift hampers for festivals and celebrations",
          ctaText: "View Gift Boxes",
          ctaLink: "/category/gift-boxes"
        }
      ];

      // Features
      const features = [
        {
          id: 1,
          icon: "fas fa-truck",
          title: "Fast Delivery",
          description: "Same day in Noida & Ghaziabad"
        },
        {
          id: 2,
          icon: "fas fa-seedling",
          title: "Premium Quality",
          description: "100% natural & fresh"
        },
        {
          id: 3,
          icon: "fas fa-undo-alt",
          title: "Easy Returns",
          description: "No questions asked"
        },
        {
          id: 4,
          icon: "fas fa-lock",
          title: "Secure Checkout",
          description: "100% secure payment"
        }
      ];

      // Categories
      const categories = await storage.getAllCategories();
      
      // Pick first 4 for home page
      const categoryHighlights = categories.slice(0, 4).map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        imageUrl: category.imageUrl,
        description: category.description
      }));

      // Testimonials
      const testimonials = [
        {
          id: 1,
          text: "I've been ordering dry fruits from NutriNuts for over a year now. Their quality is exceptional and delivery is always on time. The Ghaziabad delivery is super fast!",
          rating: 5,
          name: "Ananya Rastogi",
          location: "Ghaziabad",
          initials: "AR"
        },
        {
          id: 2,
          text: "The festival gift pack I ordered was beautifully packaged and contained the freshest dry fruits. Everyone loved it. Will definitely order again for Diwali!",
          rating: 5,
          name: "Vikram Singh",
          location: "Noida Sector 62",
          initials: "VS"
        },
        {
          id: 3,
          text: "As someone who's conscious about nutrition, I love that they provide detailed nutritional information. Their organic range is truly superior to anything available locally.",
          rating: 4.5,
          name: "Priya Raj",
          location: "Noida Sector 18",
          initials: "PR"
        }
      ];

      // Nutrition benefits
      const nutritionBenefits = [
        {
          id: 1,
          icon: "fas fa-heart",
          title: "Heart Health",
          description: "Nuts like almonds and walnuts contain heart-healthy fats that can help reduce bad cholesterol levels and lower risk of heart disease."
        },
        {
          id: 2,
          icon: "fas fa-brain",
          title: "Brain Function",
          description: "Walnuts and other nuts are rich in omega-3 fatty acids that support brain health and may improve cognitive function."
        },
        {
          id: 3,
          icon: "fas fa-weight",
          title: "Weight Management",
          description: "Despite being calorie-dense, research shows that moderate consumption of nuts and dried fruits can aid in weight management."
        },
        {
          id: 4,
          icon: "fas fa-bone",
          title: "Bone Health",
          description: "Almonds and dried figs are excellent sources of calcium and other minerals that contribute to stronger bones."
        },
        {
          id: 5,
          icon: "fas fa-tint",
          title: "Anemia Prevention",
          description: "Dried fruits like apricots and raisins are rich in iron, helping prevent anemia and maintain healthy blood."
        },
        {
          id: 6,
          icon: "fas fa-shield-alt",
          title: "Immunity Support",
          description: "Many dry fruits are loaded with antioxidants and vitamins that boost immunity and protect against diseases."
        }
      ];

      // Special offer
      const specialOffer = {
        title: "Special Festival Pack",
        description: "Limited time offer! Get our premium festival pack with assorted dry fruits and nuts at 25% off.",
        imageUrl: "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        linkUrl: "/category/gift-boxes",
        endDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
      };

      res.json({
        slides,
        features,
        categories: categoryHighlights,
        testimonials,
        nutritionBenefits,
        specialOffer
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch home page data' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
