import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ShoppingBag, ArrowDown, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products');
        const productsArray = data.products || data;
        setFeaturedProducts(productsArray.slice(0, 4));
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
    { name: 'Bridal', bgColor: '#6b1e1e', image: 'https://images.unsplash.com/photo-1596451672692-2371973f789d?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Bridal' },
    { name: 'Festive', bgColor: '#25634d', image: 'https://images.unsplash.com/photo-1615887023516-9b5da0d69b3c?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Festive' },
    { name: 'Party', bgColor: '#8a2c51', image: 'https://images.unsplash.com/photo-1583391733958-d25e07fac04f?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Party' },
    { name: 'Designer', bgColor: '#1f3d73', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Designer' },
    { name: 'Casual', bgColor: '#bc7d4d', image: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=800', link: '/shop?category=Casual' },
    { name: 'New Arrivals', bgColor: '#ac9140', image: 'https://images.unsplash.com/photo-1621008688849-ce123f1bd06b?auto=format&fit=crop&q=80&w=800', link: '/shop?newArrival=true' },
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

  return (
    <div className="min-h-screen bg-accent overflow-x-hidden">
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
        
        {/* Rich Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#3a0813]/90 via-[#2a0812]/70 to-[#1a050b]/95"></div>
        
        {/* Decorative Golden Border */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute inset-6 md:inset-8 border border-[#D4AF37]/20 pointer-events-none z-10 hidden md:block"
        >
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#D4AF37]/70"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#D4AF37]/70"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#D4AF37]/70"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#D4AF37]/70"></div>
        </motion.div>

        {/* Central Mandala SVG */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-15 pointer-events-none z-0">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_120s_linear_infinite]">
              {[...Array(24)].map((_, i) => (
                <ellipse key={i} cx="50" cy="50" rx="45" ry="6" fill="none" stroke="#D4AF37" strokeWidth="0.2" transform={`rotate(${i * 15} 50 50)`} />
              ))}
              <circle cx="50" cy="50" r="32" fill="none" stroke="#D4AF37" strokeWidth="0.2" strokeDasharray="1,1" />
              <circle cx="50" cy="50" r="22" fill="none" stroke="#D4AF37" strokeWidth="0.3" />
            </svg>
        </div>
        
        <div className="relative z-20 w-full max-w-5xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-4"
          >
            <span className="text-[#D4AF37] font-serif text-4xl md:text-6xl text-gradient" style={{ fontFamily: "'Great Vibes', cursive" }}>
              Royal Heritage
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl font-heading tracking-[0.1em] uppercase"
          >
            Shreeji Fashion
          </motion.h1>
          
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center gap-4 mb-10 w-full max-w-lg"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D4AF37]/70"></div>
            <p className="text-sm md:text-lg text-white/90 drop-shadow-md font-light tracking-[0.3em] uppercase">
              Premium Lehenga Cholis
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D4AF37]/70"></div>
          </motion.div>
          
          <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            onClick={() => navigate('/shop')}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 font-medium text-white transition-all duration-500 ease-in-out bg-transparent border border-[#D4AF37]/60 hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#1a050b] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:-translate-y-1 active:scale-95 tracking-[0.2em] uppercase text-xs md:text-sm overflow-hidden"
          >
            <span className="relative z-10">Explore Collection</span>
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
          <ArrowDown className="text-[#D4AF37] w-5 h-5 bounce-subtle" />
        </motion.div>
      </section>

      {/* Categories Section (Traditional Redesign) */}
      <section className="py-24 bg-accent relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.03] pointer-events-none transform translate-x-1/3 -translate-y-1/3">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_200s_linear_infinite]"><path fill="#D4AF37" d="M50 0 L100 50 L50 100 L0 50 Z"/></svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-[#2a0812] uppercase tracking-[0.2em] mb-4 drop-shadow-sm">
              Curated Collections
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[2px] w-12 md:w-24 bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
              <p className="text-[#D4AF37] font-serif text-2xl md:text-3xl" style={{ fontFamily: "'Great Vibes', cursive" }}>Discover your perfect style</p>
              <div className="h-[2px] w-12 md:w-24 bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
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
                  className="group block relative h-[360px] rounded-lg overflow-hidden shadow-lg transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-2"
                >
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] ease-out group-hover:scale-110"
                    style={{ backgroundImage: `url(${category.image})` }}
                  ></div>
                  
                  {/* Overlay with primary color and gradient */}
                  <div 
                    className="absolute inset-0 transition-opacity duration-500 opacity-70 group-hover:opacity-30"
                    style={{ backgroundColor: category.bgColor }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a050b]/95 via-[#1a050b]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

                  {/* Decorative border that animates on hover */}
                  <div className="absolute inset-4 md:inset-5 border border-[#D4AF37]/30 transition-all duration-700 ease-out group-hover:border-[#D4AF37]/90 group-hover:inset-3 z-10 pointer-events-none">
                    {/* Corner accents */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#D4AF37] transition-all duration-500 group-hover:scale-[1.5] group-hover:shadow-[0_0_10px_#D4AF37]"></div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#D4AF37] transition-all duration-500 group-hover:scale-[1.5] group-hover:shadow-[0_0_10px_#D4AF37]"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#D4AF37] transition-all duration-500 group-hover:scale-[1.5] group-hover:shadow-[0_0_10px_#D4AF37]"></div>
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#D4AF37] transition-all duration-500 group-hover:scale-[1.5] group-hover:shadow-[0_0_10px_#D4AF37]"></div>
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
                    <h3 className="text-3xl md:text-4xl font-bold text-white font-heading tracking-[0.15em] uppercase drop-shadow-xl transition-transform duration-500 ease-out group-hover:-translate-y-4">
                      {category.name}
                    </h3>
                    <div className="mt-4 opacity-0 transform translate-y-6 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0">
                      <span className="text-[#D4AF37] font-serif text-3xl drop-shadow-md text-gradient" style={{ fontFamily: "'Great Vibes', cursive" }}>
                        Shop Now
                      </span>
                      <div className="w-12 h-px bg-[#D4AF37] mx-auto mt-2 transition-all duration-700 delay-100 w-0 group-hover:w-16"></div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white border-t border-gray-100 relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-[0.02]">
          <div className="absolute top-20 -left-20 w-96 h-96 rounded-full border border-primary"></div>
          <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full border border-primary"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-primary mb-4 font-heading uppercase tracking-widest">Trending Now</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto"></div>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {loading ? (
              <div className="col-span-full text-center py-10 text-gray-500">Loading trending products...</div>
            ) : (
              featuredProducts.map((item) => (
                <motion.div key={item.id} variants={itemVariants} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl bg-gray-50 aspect-[3/4] mb-4 shadow-sm hover:shadow-xl transition-shadow duration-500">
                    <img 
                      src={item.images[0]?.url || 'https://via.placeholder.com/400x533'} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    
                    {/* Modern Glassmorphic Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
                      <div className="glass-dark rounded-xl p-4 flex flex-col gap-2">
                        <button 
                          onClick={() => navigate(`/product/${item.id}`)}
                          className="w-full bg-[#D4AF37] hover:bg-[#b5952f] text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" /> Quick View
                        </button>
                      </div>
                    </div>

                    {item.discount > 0 && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        -{item.discount}%
                      </div>
                    )}
                  </div>

                  <div className="px-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] text-secondary font-bold tracking-widest uppercase">{item.category}</p>
                      {item.rating > 0 && (
                        <div className="flex items-center text-[#D4AF37] text-xs">
                          <Star className="w-3 h-3 fill-current mr-1" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <Link to={`/product/${item.id}`}>
                      <h3 className="text-lg font-medium text-primary font-heading truncate transition-colors group-hover:text-secondary">{item.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{item.price - (item.price * (item.discount / 100))}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">₹{item.price}</span>
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
            <Link to="/shop" className="btn-outline inline-flex items-center gap-2 uppercase tracking-widest text-sm hover:shadow-[0_10px_20px_rgba(128,0,32,0.15)] hover:scale-105 transition-all">
              View All Products
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Shop Section */}
      <section className="py-24 bg-accent relative border-t border-[#e5dfd3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-primary mb-4 font-heading uppercase tracking-widest">
              The Shreeji Promise
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
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
                className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-[#D4AF37]/30 hover:-translate-y-2 relative overflow-hidden text-center"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl text-white font-bold bg-gradient-to-br from-primary to-primary-light mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-bold text-primary mb-4 font-heading group-hover:text-secondary transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        {/* Abstract background blobs for Newsletter */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-secondary opacity-20 rounded-full blur-3xl animate-[pulse_4s_infinite]"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#D4AF37] opacity-20 rounded-full blur-3xl animate-[pulse_6s_infinite]"></div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4 font-heading text-secondary text-gradient">
              Join Our Royal Circle
            </h2>
            <p className="text-white/80 mb-10 text-lg">
              Get exclusive offers, early access to new collections, and styling tips.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto relative">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-6 py-4 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-full focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all backdrop-blur-sm"
              />
              <button
                type="submit"
                className="px-8 py-4 text-primary font-bold rounded-full transition-all duration-300 whitespace-nowrap bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:-translate-y-1 active:scale-95 uppercase tracking-wider text-sm sm:absolute sm:right-1 sm:top-1 sm:bottom-1"
              >
                Subscribe
              </button>
            </form>

            {subscribed && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center justify-center gap-2 text-[#D4AF37] font-semibold"
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
