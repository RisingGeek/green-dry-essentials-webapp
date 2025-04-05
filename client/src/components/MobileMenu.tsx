import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { X } from 'lucide-react';
import { Category } from '@shared/schema';
import LocationSelector from './LocationSelector';

interface MobileMenuProps {
  isVisible: boolean;
  onClose: () => void;
  categories: Category[];
}

export function MobileMenu({ isVisible, onClose, categories }: MobileMenuProps) {
  const [location] = useLocation();

  // Close the menu when the route changes
  useEffect(() => {
    onClose();
  }, [location]);

  // Prevent scrolling when the menu is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="absolute right-0 top-0 h-full w-3/4 max-w-sm bg-white overflow-y-auto p-5 transform transition-transform">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-heading text-xl font-bold text-primary">Menu</h3>
          <button className="text-primary text-xl" onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Location Selector (Mobile) */}
        <div className="mb-6">
          <label className="block text-gray-600 mb-2 text-sm">Select Location</label>
          <LocationSelector />
        </div>
        
        {/* Mobile Menu Categories */}
        <ul className="space-y-1 mb-8">
          <li className="border-b border-neutral py-2">
            <Link href="/" className="block text-primary hover:text-accent">Home</Link>
          </li>
          <li className="border-b border-neutral py-2">
            <Link href="/category/all" className="block text-primary hover:text-accent">All Products</Link>
          </li>
          
          {categories.map((category) => (
            <li key={category.id} className="border-b border-neutral py-2">
              <Link 
                href={`/category/${category.slug}`} 
                className="block text-primary hover:text-accent"
              >
                {category.name}
              </Link>
            </li>
          ))}
          
          <li className="border-b border-neutral py-2">
            <Link href="/offers" className="block text-primary hover:text-accent">Offers</Link>
          </li>
          <li className="border-b border-neutral py-2">
            <Link href="/about" className="block text-primary hover:text-accent">About Us</Link>
          </li>
          <li className="border-b border-neutral py-2">
            <Link href="/contact" className="block text-primary hover:text-accent">Contact</Link>
          </li>
        </ul>
        
        {/* Account Links (Mobile) */}
        <div className="space-y-3 mb-6">
          <Link href="/account" className="flex items-center text-primary hover:text-accent">
            <i className="fas fa-user-circle mr-2"></i>
            <span>My Account</span>
          </Link>
          <Link href="/wishlist" className="flex items-center text-primary hover:text-accent">
            <i className="fas fa-heart mr-2"></i>
            <span>Wishlist</span>
          </Link>
          <Link href="/cart" className="flex items-center text-primary hover:text-accent">
            <i className="fas fa-shopping-bag mr-2"></i>
            <span>Cart</span>
          </Link>
        </div>
        
        {/* Contact Quick Links (Mobile) */}
        <div className="pt-4 border-t border-neutral">
          <h4 className="font-medium text-primary mb-2">Need Help?</h4>
          <a href="tel:+919876543210" className="flex items-center text-accent hover:underline mb-2">
            <i className="fas fa-phone-alt mr-2"></i>
            <span>+91 98765 43210</span>
          </a>
          <a href="mailto:info@nutrinuts.com" className="flex items-center text-accent hover:underline">
            <i className="fas fa-envelope mr-2"></i>
            <span>info@nutrinuts.com</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
