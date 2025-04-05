import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  address: text("address"),
  city: text("city"),
  pincode: text("pincode"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow()
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url")
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: real("price").notNull(),
  salePrice: real("sale_price"),
  imageUrl: text("image_url"),
  quantity: integer("quantity").notNull().default(0),
  categoryId: integer("category_id").references(() => categories.id),
  isFeatured: boolean("is_featured").default(false),
  isBestSeller: boolean("is_best_seller").default(false),
  isNew: boolean("is_new").default(false),
  isOrganic: boolean("is_organic").default(false),
  isPremium: boolean("is_premium").default(false),
  city: text("city"),
  ratings: real("ratings").default(0),
  reviewCount: integer("review_count").default(0),
  nutritionalInfo: text("nutritional_info"),
  weight: text("weight").notNull()
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  sessionId: text("session_id")
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull(),
  totalAmount: real("total_amount").notNull(),
  shippingAddress: text("shipping_address"),
  shippingCity: text("shipping_city"),
  shippingPincode: text("shipping_pincode"),
  paymentMethod: text("payment_method"),
  createdAt: timestamp("created_at").defaultNow()
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull()
});

export const abTests = pgTable("ab_tests", {
  id: serial("id").primaryKey(),
  testName: text("test_name").notNull(),
  variants: jsonb("variants").notNull(),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true)
});

export const abTestResults = pgTable("ab_test_results", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").references(() => abTests.id),
  variantName: text("variant_name").notNull(),
  impressions: integer("impressions").default(0),
  conversions: integer("conversions").default(0),
  sessionId: text("session_id").notNull()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  address: true,
  city: true,
  pincode: true,
  phone: true
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  imageUrl: true
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  slug: true,
  description: true,
  price: true,
  salePrice: true,
  imageUrl: true,
  quantity: true,
  categoryId: true,
  isFeatured: true,
  isBestSeller: true,
  isNew: true,
  isOrganic: true,
  isPremium: true,
  city: true,
  nutritionalInfo: true,
  weight: true
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  productId: true,
  quantity: true,
  sessionId: true
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  status: true,
  totalAmount: true,
  shippingAddress: true,
  shippingCity: true,
  shippingPincode: true,
  paymentMethod: true
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true
});

export const insertABTestSchema = createInsertSchema(abTests).pick({
  testName: true,
  variants: true,
  startDate: true,
  endDate: true,
  isActive: true
});

export const insertABTestResultSchema = createInsertSchema(abTestResults).pick({
  testId: true,
  variantName: true,
  impressions: true,
  conversions: true,
  sessionId: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type ABTest = typeof abTests.$inferSelect;
export type InsertABTest = z.infer<typeof insertABTestSchema>;

export type ABTestResult = typeof abTestResults.$inferSelect;
export type InsertABTestResult = z.infer<typeof insertABTestResultSchema>;
