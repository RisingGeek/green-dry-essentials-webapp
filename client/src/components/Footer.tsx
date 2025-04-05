import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center mb-4">
              <i className="fas fa-seedling text-accent text-2xl mr-2"></i>
              <span className="font-heading text-xl font-bold text-white">NutriNuts</span>
            </div>
            <p className="text-white/80 mb-4">Premium dry fruits supplier serving Ghaziabad and Noida with guaranteed freshness and quality.</p>
            <div className="flex space-x-3">
              <a href="https://facebook.com" className="text-white hover:text-accent transition-colors" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" className="text-white hover:text-accent transition-colors" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://twitter.com" className="text-white hover:text-accent transition-colors" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://youtube.com" className="text-white hover:text-accent transition-colors" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-white/80 hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="/category/all" className="text-white/80 hover:text-accent transition-colors">Product Catalog</Link></li>
              <li><Link href="/delivery" className="text-white/80 hover:text-accent transition-colors">Delivery Areas</Link></li>
              <li><Link href="/faq" className="text-white/80 hover:text-accent transition-colors">FAQs</Link></li>
              <li><Link href="/blog" className="text-white/80 hover:text-accent transition-colors">Blog & Recipes</Link></li>
              <li><Link href="/contact" className="text-white/80 hover:text-accent transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Column 3: Customer Service */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/account" className="text-white/80 hover:text-accent transition-colors">My Account</Link></li>
              <li><Link href="/orders/track" className="text-white/80 hover:text-accent transition-colors">Track Order</Link></li>
              <li><Link href="/returns" className="text-white/80 hover:text-accent transition-colors">Return Policy</Link></li>
              <li><Link href="/shipping" className="text-white/80 hover:text-accent transition-colors">Shipping Information</Link></li>
              <li><Link href="/wholesale" className="text-white/80 hover:text-accent transition-colors">Wholesale Inquiries</Link></li>
              <li><Link href="/terms" className="text-white/80 hover:text-accent transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
          
          {/* Column 4: Contact */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex">
                <i className="fas fa-map-marker-alt text-accent mt-1 mr-3"></i>
                <span className="text-white/80">Sector 18, Noida, UP 201301<br/>Raj Nagar, Ghaziabad, UP 201002</span>
              </li>
              <li className="flex">
                <i className="fas fa-phone-alt text-accent mt-1 mr-3"></i>
                <a href="tel:+919876543210" className="text-white/80 hover:text-accent">+91 98765 43210</a>
              </li>
              <li className="flex">
                <i className="fas fa-envelope text-accent mt-1 mr-3"></i>
                <a href="mailto:info@nutrinuts.com" className="text-white/80 hover:text-accent">info@nutrinuts.com</a>
              </li>
              <li className="flex">
                <i className="fas fa-clock text-accent mt-1 mr-3"></i>
                <span className="text-white/80">10:00 AM - 8:00 PM, All days</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-white/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} NutriNuts. All rights reserved. Proudly serving Ghaziabad & Noida.</p>
          <div className="flex space-x-4">
            <Link href="/privacy" className="text-white/70 text-sm hover:text-accent transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white/70 text-sm hover:text-accent transition-colors">Terms of Service</Link>
            <Link href="/shipping" className="text-white/70 text-sm hover:text-accent transition-colors">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
