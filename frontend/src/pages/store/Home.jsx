import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ShoppingBag } from 'lucide-react';
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
        // Just take first 4 for trending/featured
        setFeaturedProducts(data.slice(0, 4));
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

  return (
    <div className="min-h-screen bg-accent">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden flex items-center justify-center bg-[#2a0812]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat transition-transform duration-[30s] ease-linear scale-110 animate-[pulse_20s_ease-in-out_infinite]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2000&auto=format&fit=crop')" }}
        ></div>
        
        {/* Rich Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#3a0813]/90 via-[#2a0812]/80 to-[#1a050b]/95"></div>
        
        {/* Decorative Golden Border */}
        <div className="absolute inset-6 md:inset-8 border border-[#D4AF37]/20 pointer-events-none z-10 hidden md:block">
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#D4AF37]/70"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#D4AF37]/70"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#D4AF37]/70"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#D4AF37]/70"></div>
        </div>

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
          <div className="mb-4 animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
            <span className="text-[#D4AF37] font-serif text-4xl md:text-6xl" style={{ fontFamily: "'Great Vibes', cursive" }}>
              Royal Heritage
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl font-heading tracking-[0.1em] uppercase animate-fade-in" style={{ animationDelay: '0.4s', opacity: 0 }}>
            Shiv Fashion
          </h1>
          
          <div className="flex items-center justify-center gap-4 mb-10 animate-fade-in" style={{ animationDelay: '0.6s', opacity: 0 }}>
            <div className="h-px w-12 md:w-24 bg-gradient-to-r from-transparent to-[#D4AF37]/70"></div>
            <p className="text-sm md:text-lg text-white/90 drop-shadow-md font-light tracking-[0.3em] uppercase">
              Premium Lehenga Cholis
            </p>
            <div className="h-px w-12 md:w-24 bg-gradient-to-l from-transparent to-[#D4AF37]/70"></div>
          </div>
          
          <button 
            onClick={() => navigate('/shop')}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 font-medium text-white transition-all duration-500 ease-in-out bg-transparent border border-[#D4AF37]/60 hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#1a050b] tracking-[0.2em] uppercase text-xs md:text-sm animate-fade-in"
            style={{ animationDelay: '0.8s', opacity: 0 }}
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Categories Section (Traditional Redesign) */}
      <section className="py-24 bg-accent relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.03] pointer-events-none transform translate-x-1/3 -translate-y-1/3">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_200s_linear_infinite]"><path fill="#D4AF37" d="M50 0 L100 50 L50 100 L0 50 Z"/></svg>
        </div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-[0.03] pointer-events-none transform -translate-x-1/3 translate-y-1/3">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_150s_linear_infinite_reverse]"><circle cx="50" cy="50" r="40" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="5,5"/></svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-[#2a0812] uppercase tracking-[0.2em] mb-4 drop-shadow-sm">
              Curated Collections
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[2px] w-12 md:w-24 bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
              <p className="text-[#D4AF37] font-serif text-2xl md:text-3xl" style={{ fontFamily: "'Great Vibes', cursive" }}>Discover your perfect style</p>
              <div className="h-[2px] w-12 md:w-24 bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="group block relative h-[320px] rounded overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                  style={{ backgroundImage: `url(${category.image})` }}
                ></div>
                
                {/* Overlay with primary color and gradient */}
                <div 
                  className="absolute inset-0 transition-opacity duration-500 opacity-70 group-hover:opacity-40"
                  style={{ backgroundColor: category.bgColor }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a050b]/90 via-[#1a050b]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

                {/* Decorative border that animates on hover */}
                <div className="absolute inset-4 md:inset-5 border border-[#D4AF37]/40 transition-all duration-500 group-hover:border-[#D4AF37]/90 group-hover:inset-3 z-10 pointer-events-none">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#D4AF37] transition-all duration-500 group-hover:scale-[1.5]"></div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#D4AF37] transition-all duration-500 group-hover:scale-[1.5]"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#D4AF37] transition-all duration-500 group-hover:scale-[1.5]"></div>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#D4AF37] transition-all duration-500 group-hover:scale-[1.5]"></div>
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
                  <h3 className="text-3xl md:text-4xl font-bold text-white font-heading tracking-[0.15em] uppercase drop-shadow-xl group-hover:-translate-y-3 transition-transform duration-500 ease-out">
                    {category.name}
                  </h3>
                  <div className="mt-4 opacity-0 transform translate-y-4 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0">
                    <span className="text-[#D4AF37] font-serif text-2xl drop-shadow-md" style={{ fontFamily: "'Great Vibes', cursive" }}>
                      Shop Now
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products (From Screenshot 2) */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4 font-heading">Trending Now</h2>
            <div className="w-24 h-1 bg-secondary mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-10 text-gray-500">Loading trending products...</div>
            ) : (
              featuredProducts.map((item) => (
                <div key={item.id} className="group bg-accent rounded shadow-sm border border-[#e5dfd3] flex flex-col h-full overflow-hidden">
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-secondary font-bold tracking-widest uppercase mb-1">New Arrivals</p>
                      <Link to={`/product/${item.id}`}>
                        <h3 className="text-lg font-medium text-primary mb-2 font-heading truncate hover:text-secondary transition">{item.name}</h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl font-bold text-primary">
                          ₹{item.price - (item.price * (item.discount / 100))}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-sm text-gray-400 line-through">₹{item.price}</span>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="w-full bg-primary hover:bg-primary-light text-white py-3 rounded flex items-center justify-center gap-2 font-medium transition"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-3 border-2 border-primary text-primary font-semibold rounded hover:bg-primary hover:text-white transition uppercase tracking-wider text-sm">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Why Shop Section */}
      <section className="py-20 bg-accent border-t border-[#e5dfd3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4 font-heading">
              The Shiv Fashion Promise
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-xl text-white font-bold bg-secondary mb-6 shadow-lg">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-bold text-primary mb-3 font-heading">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 font-heading text-secondary">
            Join Our Royal Circle
          </h2>
          <p className="text-white/80 mb-8">
            Get exclusive offers and new collection updates
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
            <button
              type="submit"
              className="px-8 py-3 text-primary font-bold rounded hover:opacity-90 transition whitespace-nowrap bg-secondary uppercase tracking-wider text-sm"
            >
              Subscribe
            </button>
          </form>

          {subscribed && (
            <div className="mt-4 flex items-center justify-center gap-2 text-secondary font-semibold">
              <Check className="w-5 h-5" />
              Thank you for subscribing!
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
