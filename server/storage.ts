import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  cartItems, type CartItem, type InsertCartItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  abTests, type ABTest, type InsertABTest,
  abTestResults, type ABTestResult, type InsertABTestResult
} from "@shared/schema";
import { CartItemWithProduct } from "@shared/types";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Categories
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(categorySlug: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getBestSellerProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  getRelatedProducts(productId: number, categoryId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductQuantity(id: number, quantity: number): Promise<Product | undefined>;
  
  // Cart
  getCartItems(sessionId: string): Promise<CartItemWithProduct[]>;
  getCartItemByProductAndSession(productId: number, sessionId: string): Promise<CartItem | undefined>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<void>;
  clearCart(sessionId: string): Promise<void>;
  
  // Orders
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // A/B Testing
  getABTest(id: number): Promise<ABTest | undefined>;
  getABTestByName(name: string): Promise<ABTest | undefined>;
  createABTest(abTest: InsertABTest): Promise<ABTest>;
  recordABTestImpression(testId: number, variant: string, sessionId: string): Promise<void>;
  recordABTestConversion(testId: number, variant: string, sessionId: string): Promise<void>;
  
  // Newsletter
  getNewsletterSubscription(email: string): Promise<boolean>;
  addNewsletterSubscription(email: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private abTests: Map<number, ABTest>;
  private abTestResults: Map<number, ABTestResult>;
  private newsletterSubscriptions: Set<string>;
  
  currentUserId: number;
  currentCategoryId: number;
  currentProductId: number;
  currentCartItemId: number;
  currentOrderId: number;
  currentOrderItemId: number;
  currentABTestId: number;
  currentABTestResultId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.abTests = new Map();
    this.abTestResults = new Map();
    this.newsletterSubscriptions = new Set();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentABTestId = 1;
    this.currentABTestResultId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Initialize Categories
    const categoriesData: InsertCategory[] = [
      {
        name: "Nuts",
        slug: "nuts",
        description: "Premium almonds, cashews, walnuts & more",
        imageUrl: "https://images.unsplash.com/photo-1604928141064-207cea6f571f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Dried Fruits",
        slug: "dried-fruits",
        description: "Delicious figs, dates, raisins & apricots",
        imageUrl: "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Gift Boxes",
        slug: "gift-boxes",
        description: "Premium gift hampers for all occasions",
        imageUrl: "https://images.unsplash.com/photo-1550828520-4cb496926fc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Trail Mixes",
        slug: "trail-mixes",
        description: "Healthy on-the-go energy booster mixes",
        imageUrl: "https://images.unsplash.com/photo-1653038376428-7276a49ec53c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      }
    ];
    
    categoriesData.forEach(category => this.createCategory(category));
    
    // Initialize Products
    const productsData: InsertProduct[] = [
      {
        name: "Premium Cashews",
        slug: "premium-cashews",
        description: "Premium grade, crunchy whole cashews from selected farms",
        price: 649,
        salePrice: 549,
        imageUrl: "https://images.unsplash.com/photo-1599707355743-4c7b889fe66f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        quantity: 100,
        categoryId: 1, // Nuts
        isFeatured: true,
        isBestSeller: true,
        isNew: false,
        isOrganic: false,
        isPremium: true,
        city: "both",
        nutritionalInfo: "Energy: 553 kcal\nProtein: 18g\nFat: 44g\nCarbohydrates: 30g\nFiber: 3g",
        weight: "500g"
      },
      {
        name: "Mixed Dried Berries",
        slug: "mixed-dried-berries",
        description: "Assortment of dried cranberries, blueberries and goji berries",
        price: 599,
        salePrice: 499,
        imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        quantity: 80,
        categoryId: 2, // Dried Fruits
        isFeatured: true,
        isBestSeller: false,
        isNew: true,
        isOrganic: false,
        isPremium: false,
        city: "both",
        nutritionalInfo: "Energy: 324 kcal\nProtein: 2g\nFat: 1g\nCarbohydrates: 78g\nFiber: 7g",
        weight: "250g"
      },
      {
        name: "Organic Almonds",
        slug: "organic-almonds",
        description: "Certified organic California almonds, rich in nutrients",
        price: 799,
        salePrice: 699,
        imageUrl: "https://images.unsplash.com/photo-1596591868231-05e908752cc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        quantity: 120,
        categoryId: 1, // Nuts
        isFeatured: true,
        isBestSeller: false,
        isNew: false,
        isOrganic: true,
        isPremium: false,
        city: "both",
        nutritionalInfo: "Energy: 579 kcal\nProtein: 21g\nFat: 50g\nCarbohydrates: 22g\nFiber: 12g",
        weight: "500g"
      },
      {
        name: "Medjool Dates",
        slug: "medjool-dates",
        description: "Soft, sweet and succulent premium medjool dates",
        price: 899,
        salePrice: 749,
        imageUrl: "https://images.unsplash.com/photo-1596884006778-7fdcca5d1d18?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        quantity: 70,
        categoryId: 2, // Dried Fruits
        isFeatured: true,
        isBestSeller: false,
        isNew: false,
        isOrganic: false,
        isPremium: true,
        city: "both",
        nutritionalInfo: "Energy: 277 kcal\nProtein: 1.8g\nFat: 0.2g\nCarbohydrates: 75g\nFiber: 7g",
        weight: "500g"
      },
      {
        name: "Luxury Mixed Dry Fruits Box",
        slug: "luxury-mixed-box",
        description: "Premium gift box with finest selection of nuts and dry fruits",
        price: 1599,
        salePrice: 1299,
        imageUrl: "https://images.unsplash.com/photo-1567488744938-9f2a1d9f7aa2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        quantity: 30,
        categoryId: 3, // Gift Boxes
        isFeatured: false,
        isBestSeller: true,
        isNew: false,
        isOrganic: false,
        isPremium: true,
        city: "both",
        nutritionalInfo: "Varies by content",
        weight: "1kg assorted"
      },
      {
        name: "Protein Trail Mix",
        slug: "protein-trail-mix",
        description: "High-protein blend of nuts, seeds and dried fruits",
        price: 549,
        salePrice: 449,
        imageUrl: "https://images.unsplash.com/photo-1599916722396-0fd451943eea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        quantity: 90,
        categoryId: 4, // Trail Mixes
        isFeatured: false,
        isBestSeller: true,
        isNew: false,
        isOrganic: false,
        isPremium: false,
        city: "both",
        nutritionalInfo: "Energy: 490 kcal\nProtein: 18g\nFat: 35g\nCarbohydrates: 34g\nFiber: 9g",
        weight: "400g"
      },
      {
        name: "Organic Walnuts",
        slug: "organic-walnuts",
        description: "Premium Kashmiri walnuts with excellent nutritional value",
        price: 699,
        salePrice: 599,
        imageUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        quantity: 60,
        categoryId: 1, // Nuts
        isFeatured: false,
        isBestSeller: true,
        isNew: false,
        isOrganic: true,
        isPremium: true,
        city: "both",
        nutritionalInfo: "Energy: 654 kcal\nProtein: 15g\nFat: 65g\nCarbohydrates: 14g\nFiber: 7g",
        weight: "500g"
      },
      {
        name: "Premium Pistachios",
        slug: "premium-pistachios",
        description: "Large, roasted and salted pistachios with rich flavor",
        price: 999,
        salePrice: 849,
        imageUrl: "https://images.unsplash.com/photo-1607313289842-3841cc469343?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        quantity: 50,
        categoryId: 1, // Nuts
        isFeatured: false,
        isBestSeller: true,
        isNew: false,
        isOrganic: false,
        isPremium: true,
        city: "both",
        nutritionalInfo: "Energy: 562 kcal\nProtein: 20g\nFat: 45g\nCarbohydrates: 28g\nFiber: 10g",
        weight: "400g"
      }
    ];
    
    productsData.forEach(product => this.createProduct(product));
    
    // Add more product data for ratings and reviews
    const productUpdates = [
      { id: 1, ratings: 4.5, reviewCount: 42 },
      { id: 2, ratings: 4, reviewCount: 28 },
      { id: 3, ratings: 5, reviewCount: 67 },
      { id: 4, ratings: 4.5, reviewCount: 53 },
      { id: 5, ratings: 5, reviewCount: 89 },
      { id: 6, ratings: 4, reviewCount: 62 },
      { id: 7, ratings: 4.5, reviewCount: 47 },
      { id: 8, ratings: 5, reviewCount: 74 }
    ];
    
    productUpdates.forEach(update => {
      const product = this.products.get(update.id);
      if (product) {
        this.products.set(update.id, {
          ...product,
          ratings: update.ratings,
          reviewCount: update.reviewCount
        });
      }
    });
  }

  // User Operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { id, ...insertUser, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category Operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { id, ...insertCategory };
    this.categories.set(id, category);
    return category;
  }

  // Product Operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.slug === slug
    );
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    const category = await this.getCategoryBySlug(categorySlug);
    if (!category) return [];
    
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === category.id
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isFeatured
    );
  }

  async getBestSellerProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isBestSeller
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery)
    );
  }

  async getRelatedProducts(productId: number, categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.id !== productId && product.categoryId === categoryId)
      .slice(0, 4); // Return max 4 related products
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      id, 
      ...insertProduct,
      ratings: 0,
      reviewCount: 0
    };
    this.products.set(id, product);
    return product;
  }

  async updateProductQuantity(id: number, quantity: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct: Product = { ...product, quantity };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // Cart Operations
  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values()).filter(
      (item) => item.sessionId === sessionId
    );
    
    const result: CartItemWithProduct[] = [];
    
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        result.push({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            salePrice: product.salePrice,
            imageUrl: product.imageUrl,
            weight: product.weight,
            slug: product.slug
          }
        });
      }
    }
    
    return result;
  }

  async getCartItemByProductAndSession(productId: number, sessionId: string): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.productId === productId && item.sessionId === sessionId
    );
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = this.currentCartItemId++;
    const cartItem: CartItem = { id, ...insertCartItem };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem: CartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async removeFromCart(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    const itemIds: number[] = [];
    
    this.cartItems.forEach((item, id) => {
      if (item.sessionId === sessionId) {
        itemIds.push(id);
      }
    });
    
    itemIds.forEach(id => this.cartItems.delete(id));
  }

  // Order Operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const createdAt = new Date();
    const order: Order = { id, ...insertOrder, createdAt };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order Item Operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = { id, ...insertOrderItem };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // A/B Testing Operations
  async getABTest(id: number): Promise<ABTest | undefined> {
    return this.abTests.get(id);
  }

  async getABTestByName(name: string): Promise<ABTest | undefined> {
    return Array.from(this.abTests.values()).find(
      (test) => test.testName === name
    );
  }

  async createABTest(insertABTest: InsertABTest): Promise<ABTest> {
    const id = this.currentABTestId++;
    const startDate = new Date();
    const abTest: ABTest = { id, ...insertABTest, startDate };
    this.abTests.set(id, abTest);
    return abTest;
  }

  async recordABTestImpression(testId: number, variant: string, sessionId: string): Promise<void> {
    // Check if there's an existing record for this test, variant, and session
    const existingResult = Array.from(this.abTestResults.values()).find(
      (result) => result.testId === testId && result.variantName === variant && result.sessionId === sessionId
    );
    
    if (existingResult) {
      // Update existing record
      const updatedResult: ABTestResult = {
        ...existingResult,
        impressions: existingResult.impressions + 1
      };
      this.abTestResults.set(existingResult.id, updatedResult);
    } else {
      // Create new record
      const id = this.currentABTestResultId++;
      const result: ABTestResult = {
        id,
        testId,
        variantName: variant,
        impressions: 1,
        conversions: 0,
        sessionId
      };
      this.abTestResults.set(id, result);
    }
  }

  async recordABTestConversion(testId: number, variant: string, sessionId: string): Promise<void> {
    // Find the existing record for this test, variant, and session
    const existingResult = Array.from(this.abTestResults.values()).find(
      (result) => result.testId === testId && result.variantName === variant && result.sessionId === sessionId
    );
    
    if (existingResult) {
      // Update existing record
      const updatedResult: ABTestResult = {
        ...existingResult,
        conversions: existingResult.conversions + 1
      };
      this.abTestResults.set(existingResult.id, updatedResult);
    } else {
      // Create new record with both impression and conversion
      const id = this.currentABTestResultId++;
      const result: ABTestResult = {
        id,
        testId,
        variantName: variant,
        impressions: 1,
        conversions: 1,
        sessionId
      };
      this.abTestResults.set(id, result);
    }
  }

  // Newsletter Operations
  async getNewsletterSubscription(email: string): Promise<boolean> {
    return this.newsletterSubscriptions.has(email);
  }

  async addNewsletterSubscription(email: string): Promise<void> {
    this.newsletterSubscriptions.add(email);
  }
}

export const storage = new MemStorage();
