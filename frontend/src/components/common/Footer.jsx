import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full border border-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-secondary font-heading">SH</span>
              </div>
              <h3 className="font-bold text-xl text-secondary font-heading">Shiv House</h3>
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-8">
              Premium handcrafted lehenga cholis with royal Rajwadi elegance. Celebrating Indian heritage through timeless fashion.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-secondary border border-white/30 rounded-full p-2.5 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-secondary border border-white/30 rounded-full p-2.5 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="https://wa.me/919574517921" target="_blank" rel="noopener noreferrer" className="text-white hover:text-secondary border border-white/30 rounded-full p-2.5 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:ml-auto">
            <h4 className="font-heading text-lg text-secondary mb-6 font-medium">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/shop" className="text-white hover:text-secondary text-sm transition">Shop All</Link></li>
              <li><Link to="/shop?category=Bridal" className="text-white hover:text-secondary text-sm transition">Bridal Collection</Link></li>
              <li><Link to="/shop?newArrival=true" className="text-white hover:text-secondary text-sm transition">New Arrivals</Link></li>
              <li><Link to="/about" className="text-white hover:text-secondary text-sm transition">About Us</Link></li>
              <li><Link to="/faq" className="text-white hover:text-secondary text-sm transition">FAQ</Link></li>
              <li><Link to="/track-order" className="text-white hover:text-secondary text-sm transition">Track Order</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="col-span-1">
            <h4 className="font-heading text-lg text-secondary mb-6 font-medium">Policies</h4>
            <ul className="space-y-4">
              <li><Link to="/shipping" className="text-white hover:text-secondary text-sm transition">Shipping Policy</Link></li>
              <li><Link to="/returns" className="text-white hover:text-secondary text-sm transition">Return & Refund</Link></li>
              <li><Link to="/terms" className="text-white hover:text-secondary text-sm transition">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-white hover:text-secondary text-sm transition">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="font-heading text-lg text-secondary mb-6 font-medium">Contact Us</h4>
            <div className="space-y-5">
              <div className="flex gap-4 text-sm">
                <MapPin className="w-5 h-5 text-secondary flex-shrink-0" />
                <p className="text-white leading-relaxed">G-14, 16, Old Bombay Market, Surat 395010</p>
              </div>
              <div className="flex gap-4 text-sm">
                <Phone className="w-5 h-5 text-secondary flex-shrink-0" />
                <div className="text-white space-y-1">
                  <p><a href="tel:+919574517921" className="hover:text-secondary">+91 95745 17921</a></p>
                </div>
              </div>
              <div className="flex gap-4 text-sm items-center">
                <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                <p className="text-white"><a href="mailto:hello@shivfashion.com" className="hover:text-secondary">hello@shivfashion.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-primary-dark border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/80">
            <div className="flex items-center gap-6 flex-wrap justify-center">
              <span className="flex items-center gap-2">🔒 Secure Payments via Razorpay</span>
              <span className="text-secondary">✦</span>
              <span className="flex items-center gap-2">🚚 Pan-India Shipping</span>
              <span className="text-secondary">✦</span>
              <span className="flex items-center gap-2">💳 COD Available (₹500 Advance)</span>
              <span className="text-secondary">✦</span>
              <span className="flex items-center gap-2">↩️ Easy Returns</span>
            </div>
            <div className="text-center md:text-right">
              &copy; {new Date().getFullYear()} Shiv Fashion. All rights reserved. | Crafted with royal elegance.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
