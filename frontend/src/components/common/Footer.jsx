import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle, ChevronRight, ShieldCheck, Truck, CreditCard, RefreshCw } from 'lucide-react';

const Instagram = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const Facebook = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-[#2a0812] text-white/90 relative overflow-hidden">
      {/* Subtle Background Pattern/Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(128,0,32,0.15),_transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(128,0,32,0.1),_transparent_50%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mb-8">
          
          {/* Brand Section */}
          <div className="col-span-1 lg:pr-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full border border-[#D4AF37] flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#D4AF37]/20 to-transparent shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <span className="text-xl font-bold text-[#D4AF37] font-serif">SH</span>
              </div>
              <h3 className="font-bold text-2xl text-white font-serif tracking-wide">Shiv House</h3>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-8 font-light">
              Premium handcrafted lehenga cholis with royal Rajwadi elegance. Celebrating Indian heritage through timeless, luxurious fashion.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300">
                <Instagram className="w-4 h-4 text-white/70 group-hover:text-[#D4AF37] group-hover:scale-110 transition-all duration-300" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300">
                <Facebook className="w-4 h-4 text-white/70 group-hover:text-[#D4AF37] group-hover:scale-110 transition-all duration-300" />
              </a>
              <a href="https://wa.me/919574517921" target="_blank" rel="noopener noreferrer" className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300">
                <MessageCircle className="w-4 h-4 text-white/70 group-hover:text-[#D4AF37] group-hover:scale-110 transition-all duration-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 lg:pl-8">
            <h4 className="font-serif text-lg text-[#D4AF37] mb-6 font-medium tracking-wide">Quick Links</h4>
            <ul className="space-y-3.5">
              {[
                { name: 'Shop All', path: '/shop' },
                { name: 'Bridal Collection', path: '/shop?category=Bridal' },
                { name: 'New Arrivals', path: '/shop?newArrival=true' },
                { name: 'About Us', path: '/about' },
                { name: 'FAQ', path: '/faq' },
                { name: 'Track Order', path: '/track-order' }
              ].map((link, idx) => (
                <li key={idx} className="group">
                  <Link to={link.path} className="inline-flex items-center text-white/70 hover:text-[#D4AF37] text-sm transition-all duration-300">
                    <ChevronRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#D4AF37]" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="col-span-1">
            <h4 className="font-serif text-lg text-[#D4AF37] mb-6 font-medium tracking-wide">Policies</h4>
            <ul className="space-y-3.5">
              {[
                { name: 'Shipping Policy', path: '/shipping' },
                { name: 'Return & Refund', path: '/returns' },
                { name: 'Terms & Conditions', path: '/terms' },
                { name: 'Privacy Policy', path: '/privacy' }
              ].map((link, idx) => (
                <li key={idx} className="group">
                  <Link to={link.path} className="inline-flex items-center text-white/70 hover:text-[#D4AF37] text-sm transition-all duration-300">
                    <ChevronRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#D4AF37]" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="font-serif text-lg text-[#D4AF37] mb-6 font-medium tracking-wide">Contact Us</h4>
            <div className="space-y-5">
              <div className="flex items-start gap-4 text-sm group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37] transition-colors duration-300">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <p className="text-white/70 leading-relaxed pt-1">
                  <a href="https://maps.google.com/?q=G-14,+16,+Old+Bombay+Market,+Surat,+Gujarat+395010" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
                    G-14, 16, Old Bombay Market,<br/>Surat, Gujarat 395010
                  </a>
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37] transition-colors duration-300">
                  <Phone className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <p><a href="tel:+919574517921" className="text-white/70 hover:text-[#D4AF37] transition-colors duration-300">+91 95745 17921</a></p>
              </div>
              <div className="flex items-center gap-4 text-sm group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37] transition-colors duration-300">
                  <Mail className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <p><a href="mailto:hello@shivfashion.com" className="text-white/70 hover:text-[#D4AF37] transition-colors duration-300">hello@shivfashion.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#1a050b] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col xl:flex-row justify-between items-center gap-4 text-xs text-white/60">
            
            {/* Features list */}
            <div className="flex items-center gap-x-5 gap-y-3 flex-wrap justify-center xl:justify-start">
              <Link to="/terms" className="flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-pointer group">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300" /> Secure Payments
              </Link>
              <span className="text-white/20 hidden sm:inline">|</span>
              <Link to="/shipping" className="flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-pointer group">
                <Truck className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300" /> Pan-India Shipping
              </Link>
              <span className="text-white/20 hidden md:inline">|</span>
              <Link to="/terms" className="flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-pointer group">
                <CreditCard className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300" /> COD Available (₹500 Advance)
              </Link>
              <span className="text-white/20 hidden lg:inline">|</span>
              <Link to="/returns" className="flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-pointer group">
                <RefreshCw className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300" /> Easy Returns
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-center xl:text-right flex-shrink-0 tracking-wide font-light">
              &copy; {new Date().getFullYear()} Shiv Fashion. All rights reserved. <span className="hidden sm:inline mx-2 text-white/20">|</span><br className="sm:hidden" /> Crafted with royal elegance.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
