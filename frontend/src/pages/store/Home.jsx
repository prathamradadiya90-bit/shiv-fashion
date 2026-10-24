import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ShoppingBag, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import SEO from '../../components/common/SEO';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products');
        const productsArray = data.products || data || [];
        setAllProducts(productsArray);
        setFeaturedProducts(productsArray);
      } catch (error) {
        console.error('Failed to fetch featured products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  const categories = [
    { name: 'Bridal', bgColor: '#111111', image: 'https://images.unsplash.com/photo-1596451672692-2371973f789d?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Bridal' },
    { name: 'Festive', bgColor: '#18181B', image: 'https://images.unsplash.com/photo-1615887023516-9b5da0d69b3c?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Festive' },
    { name: 'Party', bgColor: '#09090B', image: 'https://images.unsplash.com/photo-1583391733958-d25e07fac04f?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Party' },
    { name: 'Designer', bgColor: '#141416', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Designer' },
    { name: 'Casual', bgColor: '#1C1C1E', image: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Casual' },
    { name: 'New Arrivals', bgColor: '#000000', image: 'https://images.unsplash.com/photo-1621008688849-ce123f1bd06b?auto=format&fit=crop&q=80&w=800', link: '/shop?newArrival=true' },
  ];

  const features = [
    { title: 'Handcrafted Luxury', description: 'Each lehenga is crafted by master artisans using centuries-old techniques.' },
    { title: 'Flexible Payments', description: 'Pay fully online or reserve with just ₹500 advance and rest on delivery.' },
    { title: 'Trusted Nationwide', description: 'Secure Razorpay checkout with safe, insured pan-India delivery.' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://chaniyacholinook.com/#organization',
        name: 'chaniyacholi.nook',
        url: 'https://chaniyacholinook.com',
        logo: 'https://chaniyacholinook.com/logo.png',
        description: 'Premier boutique of authentic designer Chaniya Choli, Navratri ghagras, bridal lehengas, and handcrafted Gujarati ethnic wear.',
        telephone: '+91-9377126401',
        email: 'support@chaniyacholinook.com',
        sameAs: [
          'https://www.instagram.com/chaniyacholi.nook',
        ],
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'G23 Old Bombay Market',
          addressLocality: 'Surat',
          addressRegion: 'Gujarat',
          postalCode: '395002',
          addressCountry: 'IN',
        },
      },
      {
        '@type': 'ClothingStore',
        '@id': 'https://chaniyacholinook.com/#store',
        name: 'chaniyacholi.nook Surat',
        image: 'https://chaniyacholinook.com/logo.png',
        priceRange: '₹₹',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'G23 Old Bombay Market',
          addressLocality: 'Surat',
          addressRegion: 'Gujarat',
          postalCode: '395002',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 21.1702,
          longitude: 72.8311,
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://chaniyacholinook.com/#website',
        url: 'https://chaniyacholinook.com',
        name: 'chaniyacholi.nook',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://chaniyacholinook.com/shop?search={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-accent overflow-x-hidden">
      <SEO
        title="chaniyacholi.nook | Designer Chaniya Choli & Navratri Lehengas"
        description="Explore exquisite designer Chaniya Choli, Navratri ghagra, bridal lehengas, and authentic Gujarati ethnic wear. Tradition • Style • You with handcrafted luxury from Surat."
        keywords="chaniyacholi.nook, designer chaniya choli surat, navratri chaniya choli online, bridal lehenga surat, gujarati ethnic wear, gamthi lehenga, kutch work choli"
        schema={homeSchema}
      />
      {/* Hero Section */}
      <section className="relative h-[95vh] min-h-[600px] flex items-center justify-center bg-[#2a0812] overflow-hidden">
        {/* Parallax Background Image */}
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2000&auto=format&fit=crop')" }}
        />
        
        {/* Rich Monochrome Noir Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-[#0D0D0D]/90 to-black"></div>
        
        {/* Decorative Minimalist Monochrome Border */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute inset-6 md:inset-8 border border-white/20 pointer-events-none z-10 hidden md:block"
        >
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-white/80"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/80"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/80"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white/80"></div>
        </motion.div>

        {/* Central Geometric SVG in Sleek Silver */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-15 pointer-events-none z-0">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_120s_linear_infinite]">
              {[...Array(24)].map((_, i) => (
                <ellipse key={i} cx="50" cy="50" rx="45" ry="6" fill="none" stroke="#FFFFFF" strokeWidth="0.2" transform={`rotate(${i * 15} 50 50)`} />
              ))}
              <circle cx="50" cy="50" r="32" fill="none" stroke="#FFFFFF" strokeWidth="0.2" strokeDasharray="1,1" />
              <circle cx="50" cy="50" r="22" fill="none" stroke="#FFFFFF" strokeWidth="0.3" />
            </svg>
        </div>
        
        <div className="relative z-20 w-full max-w-5xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          {/* Logo Emblem in Hero */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-4"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/30 p-1 shadow-[0_0_35px_rgba(255,255,255,0.2)] bg-white overflow-hidden mx-auto hover:scale-105 transition-transform duration-300">
              <img src="/logo.png" alt="chaniyacholi.nook" className="w-full h-full object-cover" />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 drop-shadow-2xl font-heading tracking-tight"
          >
            chaniyacholi<span className="text-neutral-400">.nook</span>
          </motion.h1>
          
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center gap-4 mb-10 w-full max-w-lg"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/40"></div>
            <p className="text-xs md:text-sm text-neutral-300 drop-shadow-md font-medium tracking-[0.35em] uppercase font-sans">
              Tradition • Style • You
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/40"></div>
          </motion.div>
          
          <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            onClick={() => navigate('/shop')}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 font-medium text-white transition-all duration-500 ease-in-out bg-transparent border border-white/60 hover:bg-white hover:border-white hover:text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-1 active:scale-95 tracking-[0.2em] uppercase text-xs md:text-sm overflow-hidden"
          >
            <span className="relative z-10">Shop the Collection</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
            <div className="absolute inset-0 h-full w-0 bg-white/20 transition-[width] duration-500 ease-out group-hover:w-full z-0"></div>
          </motion.button>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
        >
          <span className="text-white/60 text-xs tracking-widest uppercase mb-2">Scroll</span>
          <ArrowDown className="text-white w-5 h-5 bounce-subtle" />
        </motion.div>
      </section>

      {/* Editorial Trust & Value Bar */}
      <section className="bg-white border-y border-neutral-200 py-6 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center justify-center p-3 border-r border-neutral-100 last:border-none">
              <span className="font-heading font-bold text-2xl md:text-3xl text-black">10,000+</span>
              <span className="text-[11px] uppercase tracking-wider text-neutral-500 mt-1 font-semibold">Festive Brides Styled</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 border-r border-neutral-100 last:border-none">
              <span className="font-heading font-bold text-2xl md:text-3xl text-black">100%</span>
              <span className="text-[11px] uppercase tracking-wider text-neutral-500 mt-1 font-semibold">Surat Artisan Origin</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 border-r border-neutral-100 last:border-none">
              <span className="font-heading font-bold text-2xl md:text-3xl text-black">₹500</span>
              <span className="text-[11px] uppercase tracking-wider text-neutral-500 mt-1 font-semibold">Advance COD Booking</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3">
              <span className="font-heading font-bold text-2xl md:text-3xl text-black">4.9 ★</span>
              <span className="text-[11px] uppercase tracking-wider text-neutral-500 mt-1 font-semibold">Customer Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section (Monochrome Redesign) */}
      <section className="py-24 bg-neutral-50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.03] pointer-events-none transform translate-x-1/3 -translate-y-1/3">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_200s_linear_infinite]"><path fill="#000000" d="M50 0 L100 50 L50 100 L0 50 Z"/></svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-black uppercase tracking-[0.2em] mb-4 drop-shadow-sm">
              Curated Collections
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-neutral-400"></div>
              <p className="text-neutral-800 font-serif text-2xl md:text-3xl italic">Our Signature Styles</p>
              <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-neutral-400"></div>
            </div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
          >
            {categories.map((category) => (
              <motion.div key={category.name} variants={itemVariants}>
                <Link
                  to={category.link}
                  className="group block relative h-[360px] rounded-lg overflow-hidden shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                >
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] ease-out group-hover:scale-110"
                    style={{ backgroundImage: `url(${category.image})` }}
                  ></div>
                  
                  {/* Monochrome Overlay */}
                  <div 
                    className="absolute inset-0 transition-opacity duration-500 opacity-60 group-hover:opacity-20"
                    style={{ backgroundColor: category.bgColor }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

                  {/* Decorative border that animates on hover */}
                  <div className="absolute inset-4 md:inset-5 border border-white/30 transition-all duration-700 ease-out group-hover:border-white/90 group-hover:inset-3 z-10 pointer-events-none">
                    {/* Corner accents */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-white transition-all duration-500 group-hover:scale-[1.5] group-hover:shadow-[0_0_10px_#FFFFFF]"></div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white transition-all duration-500 group-hover:scale-[1.5] group-hover:shadow-[0_0_10px_#FFFFFF]"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white transition-all duration-500 group-hover:scale-[1.5] group-hover:shadow-[0_0_10px_#FFFFFF]"></div>
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white transition-all duration-500 group-hover:scale-[1.5] group-hover:shadow-[0_0_10px_#FFFFFF]"></div>
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
                    <h3 className="text-3xl md:text-4xl font-bold text-white font-heading tracking-[0.15em] uppercase drop-shadow-xl transition-transform duration-500 ease-out group-hover:-translate-y-4">
                      {category.name}
                    </h3>
                    <div className="mt-4 opacity-0 transform translate-y-6 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0">
                      <span className="text-white font-serif text-2xl drop-shadow-md">
                        Shop Now
                      </span>
                      <div className="w-12 h-px bg-white mx-auto mt-2 transition-all duration-700 delay-100 w-0 group-hover:w-16"></div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white border-t border-neutral-100 relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-[0.03]">
          <div className="absolute top-20 -left-20 w-96 h-96 rounded-full border border-black"></div>
          <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full border border-black"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2">Curated Masterpieces</p>
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-4 font-heading tracking-tight">Trending Now</h2>
            <div className="w-20 h-0.5 bg-black mx-auto mb-8"></div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {['All', 'Bridal', 'Festive', 'Party', 'Designer'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    selectedCategory === cat
                      ? 'bg-black text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black'
                  }`}
                >
                  {cat === 'All' ? 'All Highlights' : cat}
                </button>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7"
          >
            {loading ? (
              <div className="col-span-full text-center py-10 text-neutral-500">Loading trending products...</div>
            ) : (
              (selectedCategory === 'All' 
                ? (allProducts.length ? allProducts : featuredProducts) 
                : (allProducts.length ? allProducts : featuredProducts).filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase())
              ).slice(0, 8).map((item) => (
                <motion.div key={item.id} variants={itemVariants} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-md bg-neutral-100 aspect-[3/4] mb-4 shadow-sm hover:shadow-xl transition-shadow duration-500">
                    <img 
                      src={item.images?.[0]?.url || 'https://via.placeholder.com/400x533'} 
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    
                    {/* Discount Badge */}
                    {item.discount > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase z-20">
                        -{Math.round(item.discount / 100)}% OFF
                      </span>
                    )}

                    {/* Modern Glassmorphic Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
                      <div className="glass-dark rounded-md p-2 flex flex-col gap-2">
                        <button 
                          onClick={() => navigate(`/product/${item.id}`)}
                          className="w-full bg-black hover:bg-neutral-800 text-white py-2 rounded-sm font-medium text-xs transition-colors flex items-center justify-center gap-2 border border-neutral-700"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Quick View & Buy
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="px-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">{item.category}</p>
                    </div>
                    <Link to={`/product/${item.id}`}>
                      <h3 className="text-base font-medium text-black font-heading truncate transition-colors group-hover:text-neutral-600">{item.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-base font-bold text-black">
                        ₹{(((Number(item.price) || 0) - ((Number(item.price) || 0) * ((Number(item.discount) || 0) / 10000))) / 100).toFixed(2)}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-xs text-neutral-400 line-through">
                          ₹{((item.price || 0) / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center mt-16"
          >
            <Link to="/shop" className="btn-outline inline-flex items-center gap-2 uppercase tracking-widest text-sm hover:scale-105 transition-all">
              View All Products
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Shop Section */}
      <section className="py-24 bg-neutral-50 relative border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 font-heading tracking-wide">
              The chaniyacholi<span className="text-neutral-500">.nook</span> Promise
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent mx-auto"></div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16"
          >
            {features.map((feature, idx) => (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                className="group bg-white p-8 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-neutral-200 hover:border-black hover:-translate-y-2 relative overflow-hidden text-center"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-xl text-white font-bold bg-black mb-8 shadow-md group-hover:scale-110 transition-transform duration-500">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-bold text-black mb-4 font-heading transition-colors">{feature.title}</h3>
                <p className="text-neutral-600 leading-relaxed group-hover:text-black transition-colors">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-black text-white relative overflow-hidden border-t border-neutral-800">
        {/* Subtle background ambient gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-neutral-800 opacity-30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-neutral-800 opacity-30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4 font-heading text-white tracking-wide">
              Join Our Exclusive Circle
            </h2>
            <p className="text-neutral-400 mb-10 text-lg">
              Get exclusive offers, early access to new collections, and styling tips.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto relative">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-6 py-4 bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 rounded-full focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-black font-bold rounded-full transition-all duration-300 whitespace-nowrap hover:bg-neutral-200 hover:-translate-y-0.5 active:scale-95 uppercase tracking-wider text-sm sm:absolute sm:right-1.5 sm:top-1.5 sm:bottom-1.5"
              >
                Subscribe
              </button>
            </form>

            {subscribed && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center justify-center gap-2 text-white font-semibold"
              >
                <Check className="w-5 h-5" />
                Thank you for subscribing!
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
