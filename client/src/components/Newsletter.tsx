import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useABTest } from '@/lib/abTestContext';
import { cn } from '@/lib/utils';

const newsletterSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
});

type NewsletterForm = z.infer<typeof newsletterSchema>;

export function Newsletter() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const { config, trackConversion } = useABTest();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<NewsletterForm>({
    resolver: zodResolver(newsletterSchema)
  });

  const onSubmit = async (data: NewsletterForm) => {
    try {
      const response = await apiRequest('POST', '/api/newsletter/subscribe', data);
      
      if (response.ok) {
        setIsSubscribed(true);
        toast({
          title: "Successfully subscribed!",
          description: "Thank you for subscribing to our newsletter.",
        });
        reset();
        trackConversion('newsletter', 'signup');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <section className="py-10 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">Join Our Newsletter</h2>
          <p className="text-white/80 mb-6">Subscribe to receive special offers, recipes, and health tips</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
            <div className="flex-grow relative">
              <input 
                type="email" 
                placeholder="Your email address" 
                className={cn(
                  "w-full px-4 py-3 rounded-full focus:outline-none",
                  errors.email ? "border-2 border-red-500" : ""
                )}
                {...register("email")}
                disabled={isSubscribed}
              />
              {errors.email && (
                <p className="text-red-300 text-xs absolute -bottom-5 left-4">{errors.email.message}</p>
              )}
            </div>
            <button 
              type="submit"
              disabled={isSubmitting || isSubscribed}
              className={cn(
                "font-button bg-accent hover:bg-accentLight text-white px-6 py-3 transition-colors disabled:opacity-70",
                config.ctaStyle.value === 'rounded' ? "rounded-full" : "rounded-md"
              )}
            >
              {isSubmitting ? "Subscribing..." : isSubscribed ? "Subscribed" : "Subscribe Now"}
            </button>
          </form>
          
          <p className="text-white/70 text-sm mt-3">Your data is secured and we don't send spam emails</p>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
