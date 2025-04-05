import { Testimonial } from '@shared/types';

interface CustomerTestimonialsProps {
  testimonials: Testimonial[];
}

export function CustomerTestimonials({ testimonials }: CustomerTestimonialsProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="text-amber-400 flex mb-3">
        {Array.from({ length: Math.floor(rating) }).map((_, i) => (
          <i key={i} className="fas fa-star"></i>
        ))}
        {rating % 1 >= 0.5 && (
          <i className="fas fa-star-half-alt"></i>
        )}
        {Array.from({ length: Math.floor(5 - rating) }).map((_, i) => (
          <i key={i + 5} className="far fa-star"></i>
        ))}
      </div>
    );
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl font-bold text-primary text-center mb-2">What Our Customers Say</h2>
        <p className="text-center text-gray-600 mb-8">Hear from our satisfied customers in Ghaziabad and Noida</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-neutral p-6 rounded-lg relative">
              {renderStars(testimonial.rating)}
              <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary font-medium text-lg">{testimonial.initials}</span>
                </div>
                <div>
                  <h4 className="font-medium text-primary">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
              <div className="absolute -top-2 right-4 text-secondary opacity-20 text-6xl">
                <i className="fas fa-quote-right"></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CustomerTestimonials;
