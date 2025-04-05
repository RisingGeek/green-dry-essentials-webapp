import { CategoryHighlight } from '@shared/types';
import { Link } from 'wouter';

interface CategoryHighlightsProps {
  categories: CategoryHighlight[];
}

export function CategoryHighlights({ categories }: CategoryHighlightsProps) {
  return (
    <section className="py-12 bg-neutral">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl font-bold text-primary text-center mb-8">Shop By Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="category-card bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <h3 className="absolute bottom-3 left-3 font-heading text-xl font-semibold text-white">{category.name}</h3>
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                <Link 
                  href={`/category/${category.slug}`}
                  className="text-accent font-medium text-sm hover:underline"
                >
                  Shop {category.name} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryHighlights;
