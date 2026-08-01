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
    { name: 'Bridal', bgColor: '#6b1e1e', link: '/shop?category=Bridal' },
    { name: 'Festive', bgColor: '#25634d', link: '/shop?category=Festive' },
    { name: 'Party', bgColor: '#8a2c51', link: '/shop?category=Party' },
    { name: 'Designer', bgColor: '#1f3d73', link: '/shop?category=Designer' },
    { name: 'Casual', bgColor: '#bc7d4d', link: '/shop?category=Casual' },
    { name: 'New Arrivals', bgColor: '#ac9140', link: '/shop?newArrival=true' },
  ];

  const features = [
    { title: 'Handcrafted Luxury', description: 'Each lehenga is crafted by master artisans using centuries-old techniques.' },
    { title: 'Flexible Payments', description: 'Pay fully online or reserve with just ₹500 advance and rest on delivery.' },
    { title: 'Trusted Nationwide', description: 'Secure Razorpay checkout with safe, insured pan-India delivery.' },
  ];

  return (
    <div className="min-h-screen bg-accent">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden flex items-center justify-center">
        {/* Background Gradient matching Screenshot 1 */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#6b1e1e] via-[#4d3333] to-[#25634d]">
          {/* Subtle Mandala/Geometric Pattern */}
          <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_60s_linear_infinite]">
              {[...Array(12)].map((_, i) => (
                <ellipse key={i} cx="50" cy="50" rx="40" ry="10" fill="none" stroke="#D4AF37" strokeWidth="0.5" transform={`rotate(${i * 15} 50 50)`} />
              ))}
              <circle cx="50" cy="50" r="20" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            </svg>
          </div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 backdrop-blur transition">
             <ArrowRight className="w-6 h-6 rotate-180" />
          </button>

          <div className="text-center px-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg font-heading tracking-wide">
              Shiv Fashion
            </h1>
            <p className="text-xl md:text-2xl text-secondary mb-10 drop-shadow-md font-medium tracking-widest uppercase">
              Premium Lehenga Choli
            </p>
            <button 
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-2 px-10 py-4 text-primary font-bold rounded hover:bg-white/90 transition bg-white shadow-xl uppercase tracking-widest text-sm"
            >
              Explore Collection
            </button>
          </div>

          <button className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 backdrop-blur transition">
             <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Categories Section (From Screenshot 3) */}
      <section className="py-20 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="group block relative h-56 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ backgroundColor: category.bgColor }}
              >
                {/* Thin inner border */}
                <div className="absolute inset-3 rounded border border-white/20 group-hover:border-white/40 transition-colors duration-300">
                  {/* Plus pattern watermark */}
                  <div className="w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-3xl font-medium text-white font-heading tracking-wide group-hover:scale-105 transition-transform duration-500">
                    {category.name}
                  </h3>
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
