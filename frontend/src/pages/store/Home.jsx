import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
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
    { name: 'Bridal', icon: '👰', description: 'Royal wedding collections', link: '/shop?category=Bridal' },
    { name: 'Festive', icon: '✨', description: 'Festival collections', link: '/shop?category=Festive' },
    { name: 'Party', icon: '🎉', description: 'Party wear', link: '/shop?category=Party' },
    { name: 'Designer', icon: '💎', description: 'Exclusive designs', link: '/shop?category=Designer' },
    { name: 'Casual', icon: '👗', description: 'Everyday wear', link: '/shop?category=Casual' },
    { name: 'New Arrivals', icon: '⭐', description: 'Latest collections', link: '/shop?newArrival=true' },
  ];

  const features = [
    { title: 'Handcrafted Luxury', description: 'Each lehenga is crafted by master artisans using centuries-old techniques.' },
    { title: 'Flexible Payments', description: 'Pay fully online or reserve with just ₹500 advance and rest on delivery.' },
    { title: 'Trusted Nationwide', description: 'Secure Razorpay checkout with safe, insured pan-India delivery.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, #D4AF37 35px, #D4AF37 70px)`,
            opacity: 0.1
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Shiv Fashion
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Premium Lehenga Choli
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Authentic designer chaniya cholis crafted for your special moments
          </p>
          
          <button 
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: '#8B3A3A' }}
          >
            Explore Collection
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-600">Razorpay protected</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🚚</div>
              <h3 className="font-semibold text-gray-900 mb-2">Pan-India Shipping</h3>
              <p className="text-sm text-gray-600">Delivered to your door</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="font-semibold text-gray-900 mb-2">Partial COD</h3>
              <p className="text-sm text-gray-600">₹500 advance only</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-sm text-gray-600">Authentic collections</p>
            </div>
          </div>
        </div>
      </section>

      {/* Heritage Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-secondary text-sm font-semibold uppercase tracking-wider mb-4">Our Heritage</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Elegance in Every Thread
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At Shiv Fashion, every chaniya choli is a masterpiece born from rich traditions. We bring you the finest collection of authentic ethnic wear, crafted with intricate details and timeless designs that celebrate Indian heritage.
              </p>
              <button 
                onClick={() => navigate('/about')}
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white rounded-lg hover:opacity-90 transition bg-secondary text-gray-900"
              >
                Discover Our Story
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-red-50 rounded-lg p-12 text-center">
              <div className="text-6xl">👑</div>
              <p className="text-gray-600 mt-4">Crafted with Royal Elegance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-secondary text-sm font-semibold uppercase tracking-wider mb-4">Explore</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="group relative overflow-hidden rounded-lg p-8 transition-all duration-300 hover:shadow-lg border border-gray-200 hover:border-secondary"
              >
                <div className="text-5xl mb-4">{category.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <span className="inline-flex items-center text-secondary font-semibold group-hover:gap-2 gap-1 transition-all">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-secondary text-sm font-semibold uppercase tracking-wider mb-4">Bestsellers</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trending Now</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-10 text-gray-500">Loading trending products...</div>
            ) : (
              featuredProducts.map((item) => (
                <div key={item.id} className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative h-80 overflow-hidden bg-gray-100">
                    <img 
                      src={item.images?.[0]?.url || `https://source.unsplash.com/random/400x500/?chaniya,choli,${item.id}`}
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.discount > 0 && (
                      <div className="absolute top-3 left-3 bg-secondary text-gray-900 text-xs font-bold px-3 py-1 rounded-full z-20 shadow-sm">
                        {item.discount}% OFF
                      </div>
                    )}
                    <Link to={`/product/${item.id}`} className="absolute inset-0 z-10"></Link>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{item.name}</h3>
                    <p className="text-gray-500 text-sm mb-4 truncate">{item.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">
                        ₹{item.price - (item.price * (item.discount / 100))}
                      </span>
                      <Link to={`/product/${item.id}`} className="text-sm font-semibold text-primary hover:text-primary-light transition-colors relative z-20">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Why Shop Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Shiv Fashion Promise
            </h2>
            <p className="text-lg text-gray-600">Why Shop With Us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-start gap-4">
                  <div 
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-gray-900 font-bold bg-secondary"
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Our Royal Circle
          </h2>
          <p className="text-gray-600 mb-8">
            Get exclusive offers and new collection updates
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
            <button
              type="submit"
              className="px-8 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition whitespace-nowrap bg-primary"
            >
              Subscribe
            </button>
          </form>

          {subscribed && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600 font-semibold">
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
