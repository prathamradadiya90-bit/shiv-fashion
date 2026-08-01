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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button className="text-gray-800 hover:text-primary transition-colors">
              <Menu size={24} />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center flex-1 md:flex-none md:justify-start">
            <Link to="/" className="text-3xl font-heading font-bold text-primary tracking-wide">
              Shiv Fashion
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-gray-700 hover:text-primary font-medium transition-colors">Home</Link>
            <Link to="/shop" className="text-gray-700 hover:text-primary font-medium transition-colors">Shop</Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-primary font-medium transition-colors flex items-center">
                Categories <ChevronDown size={16} className="ml-1" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {['Bridal Wear', 'Navratri Special', 'Party Wear', 'Casual Print'].map((cat, i) => (
                  <Link key={i} to={`/shop?category=${encodeURIComponent(cat)}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{cat}</Link>
                ))}
              </div>
            </div>
            <Link to="/contact" className="text-gray-700 hover:text-primary font-medium transition-colors">Contact Us</Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            <Link to="/shop" className="text-gray-700 hover:text-primary transition-colors">
              <Search size={22} />
            </Link>
            
            {userInfo ? (
              <>
                <Link to="/wishlist" className="text-gray-700 hover:text-primary transition-colors hidden sm:block">
                  <Heart size={22} />
                </Link>
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors font-medium"
                  >
                    <User size={22} />
                    <span className="hidden sm:inline-block ml-1">{userInfo.name.split(' ')[0]}</span>
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
              </>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-primary transition-colors flex items-center">
                <User size={22} />
                <span className="hidden sm:inline-block ml-1 font-medium">Login</span>
              </Link>
            )}

            <Link to="/cart" className="text-gray-700 hover:text-primary transition-colors relative">
              <ShoppingCart size={22} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-primary-dark text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {cartItems.reduce((a, c) => a + c.quantity, 0)}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
