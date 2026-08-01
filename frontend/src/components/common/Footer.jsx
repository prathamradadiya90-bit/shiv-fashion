import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & About */}
          <div>
            <h2 className="text-3xl font-heading font-bold text-secondary mb-6">Shiv Fashion</h2>
            <p className="text-accent/80 mb-6 leading-relaxed">
              Discover the elegance of traditional Indian wear. We bring you the finest collection of authentic Chaniya Cholis for every occasion.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-accent/80 hover:text-secondary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="text-accent/80 hover:text-secondary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              </a>
              <a href="#" className="text-accent/80 hover:text-secondary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-accent">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/shop" className="text-accent/80 hover:text-secondary transition-colors">Shop Collection</Link></li>
              <li><Link to="/about" className="text-accent/80 hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-accent/80 hover:text-secondary transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="text-accent/80 hover:text-secondary transition-colors">FAQ</Link></li>
              <li><Link to="/track-order" className="text-accent/80 hover:text-secondary transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-accent">Customer Service</h3>
            <ul className="space-y-3">
              <li><Link to="/shipping" className="text-accent/80 hover:text-secondary transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="text-accent/80 hover:text-secondary transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/terms" className="text-accent/80 hover:text-secondary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-accent/80 hover:text-secondary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-accent">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={20} className="text-secondary mr-3 flex-shrink-0 mt-1" />
                <span className="text-accent/80">Old Bombay Market, Surat, Gujarat, India</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="text-secondary mr-3 flex-shrink-0" />
                <span className="text-accent/80">+91 95745 17921</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="text-secondary mr-3 flex-shrink-0" />
                <span className="text-accent/80">support@shivfashion.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 text-center text-accent/60 text-sm">
          <p>&copy; {new Date().getFullYear()} Shiv Fashion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
