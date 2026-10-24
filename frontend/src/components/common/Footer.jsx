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
    <footer className="bg-black text-white/90 relative overflow-hidden border-t border-neutral-800">
      {/* Subtle Background Pattern/Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.05),_transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.03),_transparent_50%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mb-8">
          
          {/* Brand Section */}
          <div className="col-span-1 lg:pr-6">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-14 h-14 rounded-full border border-neutral-700 overflow-hidden flex-shrink-0 shadow-lg bg-white">
                <img src="/logo.png" alt="chaniyacholi.nook logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-white font-serif tracking-wide leading-none">chaniyacholi<span className="text-neutral-400">.nook</span></h3>
                <p className="text-[10px] text-neutral-400 tracking-[0.25em] uppercase font-semibold mt-1">Tradition • Style • You</p>
              </div>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed mb-8 font-light">
              Premium handcrafted designer chaniya cholis and bridal lehengas rooted in rich Indian heritage. Handcrafted with royal craftsmanship in Surat, Gujarat.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a href="https://www.instagram.com/shreeji_fashion_surat__?igsh=MXNtaDljNjBxMXF2MQ==" target="_blank" rel="noopener noreferrer" className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 hover:border-white hover:bg-white transition-all duration-300">
                <Instagram className="w-4 h-4 text-neutral-400 group-hover:text-black group-hover:scale-110 transition-all duration-300" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 hover:border-white hover:bg-white transition-all duration-300">
                <Facebook className="w-4 h-4 text-neutral-400 group-hover:text-black group-hover:scale-110 transition-all duration-300" />
              </a>
              <a href="https://wa.me/919377126401" target="_blank" rel="noopener noreferrer" className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 hover:border-white hover:bg-white transition-all duration-300">
                <MessageCircle className="w-4 h-4 text-neutral-400 group-hover:text-black group-hover:scale-110 transition-all duration-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 lg:pl-8">
            <h4 className="font-serif text-lg text-white mb-6 font-medium tracking-wide">Quick Links</h4>
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
                  <Link to={link.path} className="inline-flex items-center text-neutral-400 hover:text-white text-sm transition-all duration-300 py-1.5 w-full">
                    <ChevronRight className="w-3 h-3 mr-2 opacity-0 md:-ml-5 group-hover:opacity-100 md:group-hover:ml-0 transition-all duration-300 text-white" />
                    <span className="md:group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="col-span-1">
            <h4 className="font-serif text-lg text-white mb-6 font-medium tracking-wide">Policies</h4>
            <ul className="space-y-3.5">
              {[
                { name: 'Shipping Policy', path: '/shipping' },
                { name: 'Return & Refund', path: '/returns' },
                { name: 'Terms & Conditions', path: '/terms' },
                { name: 'Privacy Policy', path: '/privacy' }
              ].map((link, idx) => (
                <li key={idx} className="group">
                  <Link to={link.path} className="inline-flex items-center text-neutral-400 hover:text-white text-sm transition-all duration-300">
                    <ChevronRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-white" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="font-serif text-lg text-white mb-6 font-medium tracking-wide">Contact Us</h4>
            <div className="space-y-5">
              <div className="flex items-start gap-4 text-sm group">
                <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:border-white transition-colors duration-300">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <p className="text-neutral-400 leading-relaxed pt-1">
                  <a href="https://maps.google.com/?q=G23,+Old+Bombay+Market,+Surat,+Gujarat" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
                    G23 Old bombay Market,<br/>Surat, Gujarat
                  </a>
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm group">
                <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:border-white transition-colors duration-300">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <p>
                  <a href="tel:+919377126401" className="text-neutral-400 hover:text-white transition-colors duration-300">+91 93771 26401</a><br/>
                  <a href="tel:+918734975590" className="text-neutral-400 hover:text-white transition-colors duration-300">+91 87349 75590</a>
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm group">
                <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:border-white transition-colors duration-300">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <p><a href="mailto:Shreejifashiong23@gmail.com" className="text-neutral-400 hover:text-white transition-colors duration-300">Shreejifashiong23@gmail.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#080808] border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col xl:flex-row justify-between items-center gap-4 text-xs text-neutral-400">
            
            {/* Features list */}
            <div className="flex items-center gap-x-5 gap-y-3 flex-wrap justify-center xl:justify-start">
              <Link to="/terms" className="flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-pointer group">
                <ShieldCheck className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" /> Secure Payments
              </Link>
              <span className="text-white/20 hidden sm:inline">|</span>
              <Link to="/shipping" className="flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-pointer group">
                <Truck className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" /> Pan-India Shipping
              </Link>
              <span className="text-white/20 hidden md:inline">|</span>
              <Link to="/terms" className="flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-pointer group">
                <CreditCard className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" /> COD Available (₹500 Advance)
              </Link>
              <span className="text-white/20 hidden lg:inline">|</span>
              <Link to="/returns" className="flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-pointer group">
                <RefreshCw className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" /> Easy Returns
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-center xl:text-right flex-shrink-0 tracking-wide font-light">
              &copy; {new Date().getFullYear()} chaniyacholi.nook. All rights reserved. <span className="hidden sm:inline mx-2 text-white/20">|</span><br className="sm:hidden" /> Tradition • Style • You
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
