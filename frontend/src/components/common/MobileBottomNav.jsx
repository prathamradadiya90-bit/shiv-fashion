import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useSelector } from 'react-redux';

const MobileBottomNav = () => {
  const location = useLocation();
  const { cartItems } = useSelector((state) => state.cart || { cartItems: [] });
  const { userInfo } = useSelector((state) => state.auth || {});

  const totalCartCount = (cartItems || []).reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: Compass },
    { label: 'Wishlist', path: '/wishlist', icon: Heart },
    { label: 'Bag', path: '/cart', icon: ShoppingBag, count: totalCartCount },
    { label: userInfo ? 'Profile' : 'Login', path: userInfo ? '/profile' : '/login', icon: User },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 relative transition-colors ${
                isActive ? 'text-black font-bold' : 'text-neutral-500 hover:text-black font-medium'
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-black text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-black mt-0.5"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
