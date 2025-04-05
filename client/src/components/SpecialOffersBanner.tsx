import { useState, useEffect } from 'react';
import { useABTest } from '@/lib/abTestContext';
import { cn } from '@/lib/utils';

interface SpecialOffersBannerProps {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  endDate: Date;
}

export function SpecialOffersBanner({ 
  title, 
  description, 
  imageUrl, 
  linkUrl,
  endDate 
}: SpecialOffersBannerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const { config, trackImpression, trackConversion } = useABTest();

  useEffect(() => {
    // Track banner impression
    trackImpression('specialOfferBanner', 'default');

    // Update countdown timer every second
    const timer = setInterval(() => {
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [endDate]);

  const handleViewOffer = () => {
    trackConversion('specialOfferBanner', 'default');
  };

  return (
    <section className="py-10 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-lg bg-primary">
          <div className="md:flex items-center">
            <div className="md:w-1/2 p-8 md:p-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
                {title}
              </h2>
              <p className="text-white/90 mb-6">{description}</p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex flex-col items-center bg-white/20 p-3 rounded">
                  <span className="text-white text-3xl font-bold">{timeLeft.days.toString().padStart(2, '0')}</span>
                  <span className="text-white/80 text-sm">Days</span>
                </div>
                <div className="flex flex-col items-center bg-white/20 p-3 rounded">
                  <span className="text-white text-3xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
                  <span className="text-white/80 text-sm">Hours</span>
                </div>
                <div className="flex flex-col items-center bg-white/20 p-3 rounded">
                  <span className="text-white text-3xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                  <span className="text-white/80 text-sm">Minutes</span>
                </div>
              </div>
              
              <a 
                href={linkUrl}
                onClick={handleViewOffer}
                className={cn(
                  "font-button inline-block px-6 py-3 bg-accent hover:bg-accentLight text-white transition-colors",
                  config.ctaStyle.value === 'rounded' ? "rounded-full" : "rounded-md"
                )}
              >
                Shop Festival Offers
              </a>
            </div>
            <div className="hidden md:block md:w-1/2">
              <img 
                src={imageUrl}
                alt="Festival special dry fruits pack"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SpecialOffersBanner;
