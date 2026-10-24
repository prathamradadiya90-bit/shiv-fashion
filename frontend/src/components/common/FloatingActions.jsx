import React, { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';

const FloatingActions = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const openWhatsApp = () => {
    const phone = '919377126401';
    const message = encodeURIComponent('Hello chaniyacholi.nook team, I would like to inquire about your designer Chaniya Choli collection.');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <aside aria-label="Quick site actions" className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-center gap-3">
      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="w-11 h-11 rounded-full bg-white text-black border border-neutral-300 shadow-xl flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300 active:scale-95 group"
          title="Back to top"
        >
          <ArrowUp size={18} className="transition-transform group-hover:-translate-y-0.5" />
        </button>
      )}

      {/* WhatsApp Stylist Help Button */}
      <button
        onClick={openWhatsApp}
        aria-label="Chat on WhatsApp"
        className="group relative flex items-center gap-2.5 h-12 px-4 rounded-full bg-black text-white border border-neutral-700 shadow-2xl hover:bg-neutral-900 hover:border-white transition-all duration-300 active:scale-95 overflow-hidden"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
          <MessageCircle size={15} className="fill-current" />
        </div>
        <span className="text-xs font-bold tracking-wide uppercase hidden sm:inline-block">
          Stylist Help
        </span>
      </button>
    </aside>
  );
};

export default FloatingActions;
