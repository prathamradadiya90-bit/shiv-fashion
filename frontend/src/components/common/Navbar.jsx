import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, Search, Menu, LogOut, LayoutDashboard, Heart, ChevronDown } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/api';

const Navbar = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Promo Banner */}
      <div className="bg-primary border-b border-primary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
          <p className="text-xs text-center text-secondary tracking-wide font-medium">
            ✦ Shipping ₹299 / pc · ₹5,000+ → ₹499 / pc | Pay ₹500 advance + COD available ✦
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
              <Link to="/" className="text-xl font-bold text-primary block leading-none font-heading tracking-wide mb-1">Shiv House</Link>
              <p className="text-[10px] text-secondary tracking-widest leading-none uppercase font-semibold">Premium Lehenga</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors">Home</Link>
            <Link to="/shop" className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors">Shop</Link>
            <Link to="/track-order" className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors">Track Order</Link>
            <Link to="/about" className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors">Contact</Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-5">
            <Link to="/shop" className="text-gray-800 hover:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            
            {userInfo ? (
              <div className="flex items-center gap-5">
                <Link to="/wishlist" className="text-gray-800 hover:text-primary transition-colors hidden sm:block">
                  <Heart className="w-5 h-5" />
                </Link>
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-1 text-gray-800 hover:text-primary transition-colors font-medium"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  
                  {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{userInfo.name}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>My Profile</Link>
                      <Link to="/my-orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>My Orders</Link>
                      <Link to="/wishlist" className="block sm:hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>Wishlist</Link>
                      {userInfo.role === 'SUPERADMIN' && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-primary hover:bg-gray-100 font-medium" onClick={() => setDropdownOpen(false)}>
                          Admin Dashboard
                        </Link>
                      )}
                      <button 
                        onClick={logoutHandler}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut size={14} className="mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-gray-800 hover:text-primary transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}

            <Link to="/cart" className="text-gray-800 hover:text-primary transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-primary-dark text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                  {cartItems.reduce((a, c) => a + c.quantity, 0)}
                </span>
              )}
            </Link>
            
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
            <Link to="/about" className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
