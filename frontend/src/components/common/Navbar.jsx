import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  Heart, 
  LogOut, 
  X, 
  ArrowRight, 
  Loader2,
  Sparkles,
  Settings, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { FALLBACK_IMAGE } from '../../utils/constants';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/api';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Live Search States
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Live Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(searchQuery.trim())}&pageSize=6`);
        setSearchResults(data.products || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 280);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleOpenSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const logoutHandler = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const totalCartCount = (cartItems || []).reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <header className="sticky top-0 z-50 glass shadow-xs">
      {/* Promo Banner */}
      <div className="bg-primary border-b border-primary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
          <p className="text-xs text-center text-secondary tracking-wide font-medium">
            ✦ Flat ₹250 Shipping · Free Shipping on orders over ₹5,000 | Pay ₹500 advance + COD available ✦
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-xl font-bold text-secondary">SH</span>
            </Link>
            <div className="hidden sm:block">
              <Link to="/" className="text-xl font-bold text-primary block leading-none font-heading tracking-wide mb-1">Shreeji Fashion</Link>
              <p className="text-[10px] text-secondary tracking-widest leading-none uppercase font-semibold">Premium Lehenga</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/shop" className="nav-link">Shop</Link>
            <Link to="/track-order" className="nav-link">Track Order</Link>
            <Link to="/faq" className="nav-link">FAQ</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </nav>

          {/* Icons & Live Search Trigger */}
          <div className="flex items-center gap-5">
            
            {/* Live Search Icon / Toggle */}
            <div className="relative" ref={searchContainerRef}>
              <button 
                onClick={handleOpenSearch}
                className="text-gray-800 hover:text-primary transition-colors p-1"
                title="Search products..."
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Interactive Live Search Dropdown */}
              {searchOpen && (
                <div className="absolute right-0 sm:-right-16 top-10 w-[88vw] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-3">
                    <Search size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search lehengas, cholis, fabrics..."
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#800020] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  </form>

                  {/* Search Results Preview */}
                  <div className="max-h-[320px] overflow-y-auto space-y-2 divide-y divide-slate-100">
                    {searchLoading ? (
                      <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin text-[#800020]" />
                        <span>Searching catalog...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => {
                              navigate(`/product/${product.id}`);
                              setSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
                          >
                            <img
                              src={product.images?.[0]?.url || FALLBACK_IMAGE}
                              alt={product.name}
                              className="w-12 h-14 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#800020] transition-colors">
                                {product.name}
                              </h4>
                              <p className="text-[11px] text-slate-400">{product.category}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-[#800020]">
                                  ₹{((product.price - Math.round(product.price * (product.discount / 10000))) / 100).toFixed(2)}
                                </span>
                                {product.discount > 0 && (
                                  <span className="text-[10px] text-slate-400 line-through">
                                    ₹{(product.price / 100).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight size={14} className="text-slate-300 group-hover:text-[#800020] group-hover:translate-x-0.5 transition-all" />
                          </div>
                        ))}

                        <div className="pt-2 text-center">
                          <button
                            type="button"
                            onClick={handleSearchSubmit}
                            className="text-xs font-bold text-[#800020] hover:underline flex items-center justify-center gap-1 w-full py-1"
                          >
                            <span>View all results for "{searchQuery}"</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    ) : searchQuery.trim() ? (
                      <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                        <p className="font-semibold text-slate-700">No products found</p>
                        <p>Try searching for "Navratri", "Silk", "Mirror Work", or "Georgette"</p>
                      </div>
                    ) : (
                      <div className="py-4 px-2 text-xs text-slate-400 flex items-center gap-2">
                        <Sparkles size={14} className="text-[#800020]" />
                        <span>Type keywords to search traditional collections instantly</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* User Account / Dropdown */}
            {userInfo ? (
              <div className="flex items-center gap-5">
                <Link to="/wishlist" className="text-gray-800 hover:text-primary transition-colors hidden sm:block" title="Wishlist">
                  <Heart className="w-5 h-5" />
                </Link>
                
                <NotificationBell />

                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-1 text-gray-800 hover:text-primary transition-colors font-medium"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-1 border border-gray-100 z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{userInfo.name}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>My Profile</Link>
                      <Link to="/my-orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>My Orders</Link>
                      <Link to="/wishlist" className="block sm:hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>Wishlist</Link>
                      {userInfo.role === 'SUPERADMIN' && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-primary hover:bg-gray-50 font-medium" onClick={() => setDropdownOpen(false)}>
                          Admin Dashboard
                        </Link>
                      )}
                      <button 
                        onClick={logoutHandler}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center"
                      >
                        <LogOut size={14} className="mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-gray-800 hover:text-primary transition-colors" title="Login / Register">
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Shopping Cart (Accessible to Guests and Authenticated Users) */}
            <Link 
              to="/cart"
              className="text-gray-800 hover:text-primary transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-primary-dark text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-gray-800 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100 flex flex-col space-y-4">
            <Link to="/" className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/shop" className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
            <Link to="/track-order" className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Track Order</Link>
            <Link to="/faq" className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
            <Link to="/about" className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
