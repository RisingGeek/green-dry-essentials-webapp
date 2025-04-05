import { useState, useEffect } from 'react';
import { Slide } from '@shared/types';
import { useABTest } from '@/lib/abTestContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSliderProps {
  slides: Slide[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { config, trackImpression } = useABTest();

  useEffect(() => {
    // Track impression of the hero slider
    trackImpression('heroSlider', 'default');

    // Set up auto slide
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const scrollToFeatured = () => {
    const featuredSection = document.getElementById('featured-products');
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const slide = slides[currentSlide];

  return (
    <section className="relative bg-neutral">
      <div className="relative overflow-hidden h-[300px] md:h-[400px] lg:h-[500px]">
        {/* Main Hero Slide */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">
          <img 
            src={slide.imageUrl}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="relative z-10 text-center px-6 max-w-4xl">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {slide.title}
            </h1>
            <p className="text-white text-lg md:text-xl mb-6">
              {slide.description}
            </p>
            <a 
              href={slide.ctaLink} 
              onClick={(e) => {
                e.preventDefault();
                scrollToFeatured();
              }}
              className={cn(
                "font-button px-8 py-3 bg-accent hover:bg-accent/90 text-white inline-block transition-colors",
                config.ctaStyle.value === 'rounded' ? "rounded-full" : "rounded-md"
              )}
            >
              {slide.ctaText}
            </a>
          </div>
        </div>
        
        {/* Slider Controls */}
        <button 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full text-primary"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full text-primary"
          onClick={nextSlide}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        
        {/* Slider Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button 
              key={index}
              className={`w-3 h-3 rounded-full bg-white ${index === currentSlide ? 'opacity-100' : 'opacity-50'}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSlider;
