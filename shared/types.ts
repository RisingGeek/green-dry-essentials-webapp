export type Location = 'ghaziabad' | 'noida' | 'both';

export interface Slide {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

export interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface CategoryHighlight {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  description: string;
}

export interface Testimonial {
  id: number;
  text: string;
  rating: number;
  name: string;
  location: string;
  initials: string;
}

export interface NutritionBenefit {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface ABTestVariant {
  name: string;
  value: string;
}

export interface ABTestConfig {
  productCardStyle: ABTestVariant;
  ctaStyle: ABTestVariant;
}

export interface CartItemWithProduct {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    salePrice?: number;
    imageUrl: string;
    weight: string;
  }
}

export interface CartSummary {
  subtotal: number;
  delivery: number;
  tax: number;
  total: number;
}
