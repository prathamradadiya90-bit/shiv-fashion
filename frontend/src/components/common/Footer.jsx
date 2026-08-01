import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Section */}
        <div className="mb-12 pb-12 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-secondary">SH</span>
            <div>
              <h3 className="font-bold text-lg">Shiv Fashion</h3>
              <p className="text-sm text-gray-400">Premium handcrafted lehenga cholis</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm max-w-sm">
            Premium handcrafted lehenga cholis with royal Rajwadi elegance. Celebrating Indian heritage through timeless fashion.
          </p>
          
          {/* Social Links */}
          <div className="flex gap-4 mt-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-secondary transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-secondary transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://wa.me/919574517921" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-secondary transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-gray-400 hover:text-secondary text-sm transition">Shop All</Link></li>
              <li><Link to="/shop?category=Bridal" className="text-gray-400 hover:text-secondary text-sm transition">Bridal Collection</Link></li>
              <li><Link to="/shop?newArrival=true" className="text-gray-400 hover:text-secondary text-sm transition">New Arrivals</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-secondary text-sm transition">About Us</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-secondary text-sm transition">FAQ</Link></li>
              <li><Link to="/track-order" className="text-gray-400 hover:text-secondary text-sm transition">Track Order</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-bold text-white mb-4">Policies</h4>
            <ul className="space-y-2">
              <li><Link to="/shipping" className="text-gray-400 hover:text-secondary text-sm transition">Shipping Policy</Link></li>
              <li><Link to="/returns" className="text-gray-400 hover:text-secondary text-sm transition">Return & Refund</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-secondary text-sm transition">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-secondary text-sm transition">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex gap-3 text-sm">
                <MapPin className="w-4 h-4 text-secondary flex-shrink-0 mt-1" />
                <p className="text-gray-400">Old Bombay Market, Surat, Gujarat, India</p>
              </div>
              <div className="flex gap-3 text-sm">
                <Phone className="w-4 h-4 text-secondary flex-shrink-0 mt-1" />
                <div className="text-gray-400">
                  <p><a href="tel:+919574517921" className="hover:text-secondary">+91 95745 17921</a></p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <Mail className="w-4 h-4 text-secondary flex-shrink-0 mt-1" />
                <p className="text-gray-400"><a href="mailto:support@shivfashion.com" className="hover:text-secondary">support@shivfashion.com</a></p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p className="mb-4">🔒 Secure Payments via Razorpay ✦ 🚚 Pan-India Shipping ✦ 💳 COD Available (₹500 Advance) ✦ ↩️ Easy Returns</p>
          <p>&copy; {new Date().getFullYear()} Shiv Fashion. All rights reserved. | Crafted with royal elegance.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
