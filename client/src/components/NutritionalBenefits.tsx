import { NutritionBenefit } from '@shared/types';

interface NutritionalBenefitsProps {
  benefits: NutritionBenefit[];
}

export function NutritionalBenefits({ benefits }: NutritionalBenefitsProps) {
  return (
    <section className="py-12 bg-neutral">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl font-bold text-primary text-center mb-2">Health Benefits</h2>
        <p className="text-center text-gray-600 mb-8">Why dry fruits should be part of your daily diet</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                <i className={`${benefit.icon} text-primary text-2xl`}></i>
              </div>
              <h3 className="font-heading text-xl font-bold text-primary mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NutritionalBenefits;
