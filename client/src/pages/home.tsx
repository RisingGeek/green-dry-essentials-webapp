import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Slide, Feature, CategoryHighlight, Testimonial, NutritionBenefit } from '@shared/types';
import Header from '@/components/Header';
import AnnouncementBar from '@/components/AnnouncementBar';
import HeroSlider from '@/components/HeroSlider';
import FeatureHighlights from '@/components/FeatureHighlights';
import CategoryHighlights from '@/components/CategoryHighlights';
import FeaturedProducts from '@/components/FeaturedProducts';
import SpecialOffersBanner from '@/components/SpecialOffersBanner';
import BestSellers from '@/components/BestSellers';
import CustomerTestimonials from '@/components/CustomerTestimonials';
import NutritionalBenefits from '@/components/NutritionalBenefits';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import { useABTest } from '@/lib/abTestContext';

export default function Home() {
  const { trackImpression } = useABTest();

  const { data: homeData } = useQuery({
    queryKey: ['/api/home'],
  });

  useEffect(() => {
    // Track a page impression
    trackImpression('homePage', 'default');
    
    // Set page title
    document.title = 'NutriNuts - Premium Dry Fruits in Ghaziabad & Noida';
  }, []);

  // If no data yet, simply display the header
  if (!homeData) {
    return (
      <>
        <AnnouncementBar message="Free delivery on orders above ₹999 in Ghaziabad & Noida! Use code: NUTRILOCAL" />
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  const slides: Slide[] = homeData.slides;
  const features: Feature[] = homeData.features;
  const categories: CategoryHighlight[] = homeData.categories;
  const testimonials: Testimonial[] = homeData.testimonials;
  const nutritionBenefits: NutritionBenefit[] = homeData.nutritionBenefits;
  const specialOffer = homeData.specialOffer;

  // Calculate the end date for the special offer countdown
  const offerEndDate = new Date(specialOffer.endDate);

  return (
    <>
      <AnnouncementBar message="Free delivery on orders above ₹999 in Ghaziabad & Noida! Use code: NUTRILOCAL" />
      <Header />
      <main>
        <HeroSlider slides={slides} />
        <FeatureHighlights features={features} />
        <CategoryHighlights categories={categories} />
        <FeaturedProducts />
        <SpecialOffersBanner 
          title={specialOffer.title}
          description={specialOffer.description}
          imageUrl={specialOffer.imageUrl}
          linkUrl={specialOffer.linkUrl}
          endDate={offerEndDate}
        />
        <BestSellers />
        <CustomerTestimonials testimonials={testimonials} />
        <NutritionalBenefits benefits={nutritionBenefits} />
        <Newsletter />
      </main>
      <Footer />
      
      {/* Mobile Cart Shortcut */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <button 
          className="w-14 h-14 rounded-full bg-accent text-white shadow-lg flex items-center justify-center relative"
          onClick={() => document.dispatchEvent(new CustomEvent('toggle-cart'))}
        >
          <i className="fas fa-shopping-bag text-xl"></i>
          <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {3}
          </span>
        </button>
      </div>
    </>
  );
}
