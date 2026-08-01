import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import api from '../../services/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1583391733958-d15fa8452dc8?q=80&w=2000&auto=format&fit=crop" 
          alt="Traditional Indian Wear" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 drop-shadow-lg">
            Elegance in Every Thread
          </h1>
          <p className="text-xl md:text-2xl text-accent mb-10 drop-shadow-md">
            Discover our exclusive collection of premium Chaniya Cholis designed for your special moments.
          </p>
          <Link to="/shop" className="btn-secondary text-lg px-8 py-4 inline-flex items-center group shadow-lg">
            Shop Collection 
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">Shop by Category</h2>
            <div className="w-24 h-1 bg-secondary mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Bridal Wear', 'Navratri Special', 'Party Wear'].map((category, index) => (
              <div key={index} className="group relative h-96 overflow-hidden rounded-xl shadow-md cursor-pointer">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                <img 
                  src={`https://source.unsplash.com/random/800x600/?indian,dress,${index}`} 
                  alt={category} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-10">
                  <h3 className="text-2xl font-bold text-white mb-4">{category}</h3>
                  <span className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                    Explore &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">Trending Now</h2>
            <div className="w-24 h-1 bg-secondary mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-10">Loading trending products...</div>
            ) : (
              featuredProducts.map((item) => (
                <div key={item.id} className="card group">
                  <div className="relative h-80 overflow-hidden">
                    <img 
                      src={item.images?.[0]?.url || `https://source.unsplash.com/random/400x500/?chaniya,choli,${item.id}`}
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {item.discount > 0 && (
                      <div className="absolute top-3 left-3 bg-secondary text-primary-dark text-xs font-bold px-2 py-1 rounded z-20">
                        {item.discount}% OFF
                      </div>
                    )}
                    <Link to={`/product/${item.id}`} className="absolute inset-0 z-10"></Link>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{item.name}</h3>
                    <p className="text-gray-500 text-sm mb-4 truncate">{item.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">
                        ₹{item.price - (item.price * (item.discount / 100))}
                      </span>
                      <Link to={`/product/${item.id}`} className="text-sm font-medium text-primary hover:text-primary-light transition-colors relative z-20">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/shop" className="btn-outline inline-block">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Join Our Community</h2>
          <p className="text-accent/80 mb-8">Subscribe to our newsletter for exclusive offers, new arrivals, and style tips.</p>
          <form className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-grow px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <button type="submit" className="btn-secondary whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
