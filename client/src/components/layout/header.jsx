import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { CartDrawer } from '../cart/CartDrawer';
import { logout } from   '../../redux/slices/authSlice';

export const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (!response.ok) throw new Error('The server could not clear the session cookies.');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      dispatch(logout());
      setIsAccountMenuOpen(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <a href="/" className="text-xl font-bold tracking-tight text-slate-900">
              TINY <span className="text-indigo-600">TOME</span>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="/products" className="hover:text-indigo-600 transition-colors">Shop Shelves</a>
              <a href="/products?category=Miniature%20Bookshelves" className="hover:text-indigo-600 transition-colors">Miniature Bookshelves</a>
            </nav>
          </div>

          {/* Debounced Live Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shelves by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-full focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            
            {/* User Account State */}
            {userInfo ? (
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={isAccountMenuOpen}
                  aria-controls="account-menu"
                  onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">{userInfo.name}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                <div
                  id="account-menu"
                  role="menu"
                  className={`absolute right-0 mt-2 w-48 rounded-lg border border-slate-100 bg-white py-1 shadow-lg ${isAccountMenuOpen ? 'block' : 'hidden'}`}
                >
                  {userInfo.role === 'admin' && (
                    <a href="/admin" role="menuitem" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Admin Dashboard</a>
                  )}
                  <button 
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <a href="/login" className="p-2 text-slate-600 hover:text-indigo-600 transition-colors">
                <User className="h-5 w-5" />
              </a>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-600 hover:text-indigo-600 transition-colors"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Cart Slide-Over Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};