import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useCart } from "@/lib/cartContext";
import LocationSelector from "./LocationSelector";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";
import CartSidebar from "./CartSidebar";
import { useQuery } from "@tanstack/react-query";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isCartOpen, toggleCart, getCartCount } = useCart();

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <i className="fas fa-seedling text-accent text-3xl mr-2"></i>
                <span className="font-heading text-2xl font-bold text-primary">NutriNuts</span>
              </Link>
            </div>

            {/* Location Selector */}
            <div className="hidden md:flex items-center mx-4">
              <LocationSelector />
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-4">
              <SearchBar />
            </div>

            {/* Navigation Icons */}
            <div className="flex items-center space-x-4">
              {/* Account */}
              <Link href="#" className="text-primary hover:text-primaryLight transition-colors">
                <i className="fas fa-user-circle text-xl"></i>
              </Link>
              
              {/* Wishlist */}
              <Link href="#" className="text-primary hover:text-primaryLight transition-colors">
                <i className="fas fa-heart text-xl"></i>
              </Link>
              
              {/* Cart */}
              <button 
                onClick={toggleCart}
                className="text-primary hover:text-primaryLight transition-colors relative"
              >
                <i className="fas fa-shopping-bag text-xl"></i>
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              </button>
              
              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden text-primary" 
                onClick={toggleMobileMenu}
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>
          </div>
          
          {/* Main Navigation */}
          <nav className="hidden md:flex items-center justify-center py-2 mt-1 border-t border-secondaryLight">
            <Link href="/" className="px-4 py-1 text-primary hover:text-accent font-medium transition-colors">
              All Products
            </Link>
            {categories?.map((category: any) => (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className="px-4 py-1 text-primary hover:text-accent font-medium transition-colors"
              >
                {category.name}
              </Link>
            ))}
            <Link href="/offers" className="px-4 py-1 text-primary hover:text-accent font-medium transition-colors">
              Offers
            </Link>
          </nav>
          
          {/* Mobile Search - only visible on mobile */}
          <div className="mt-3 md:hidden">
            <SearchBar />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isVisible={isMobileMenuOpen} 
        onClose={closeMobileMenu} 
        categories={categories || []} 
      />

      {/* Cart Sidebar */}
      <CartSidebar isVisible={isCartOpen} />
    </>
  );
}

export default Header;
