import { Feature } from '@shared/types';

interface FeatureHighlightsProps {
  features: Feature[];
}

export function FeatureHighlights({ features }: FeatureHighlightsProps) {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {features.map((feature) => (
            <div key={feature.id} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-3">
                <i className={`${feature.icon} text-primary text-2xl`}></i>
              </div>
              <h3 className="font-medium text-lg text-primary">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureHighlights;
