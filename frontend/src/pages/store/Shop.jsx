import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, Search, Heart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [sortBy, setSortBy] = useState('Latest');
  
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParamsObj = new URLSearchParams({ pageNumber: page });
        if (searchTerm) queryParamsObj.append('search', searchTerm);
        if (categoryParam) queryParamsObj.append('category', categoryParam);

        const { data } = await api.get(`/products?${queryParamsObj.toString()}`);
        setProducts(data.products || data);
        if (data.pages) setPages(data.pages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, searchTerm, categoryParam]);

  const toggleWishlist = async (e, id) => {
    e.preventDefault(); // Prevent navigating to product details
    try {
      const { data } = await api.post(`/products/${id}/wishlist`);
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Please login to use wishlist');
    }
  };

  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedPrices([]);
    if (categoryParam) {
      navigate('/shop');
    }
  };

  const handlePriceChange = (priceStr) => {
    setSelectedPrices(prev => 
      prev.includes(priceStr) ? prev.filter(p => p !== priceStr) : [...prev, priceStr]
    );
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryParam ? p.category === categoryParam : true;
    
    let matchesPrice = true;
    if (selectedPrices.length > 0) {
      matchesPrice = selectedPrices.some(priceRange => {
        const priceInRupees = p.price / 100;
        if (priceRange === 'Under ₹2,000') return priceInRupees < 2000;
        if (priceRange === '₹2,000 - ₹5,000') return priceInRupees >= 2000 && priceInRupees <= 5000;
        if (priceRange === '₹5,000 - ₹10,000') return priceInRupees >= 5000 && priceInRupees <= 10000;
        if (priceRange === 'Above ₹10,000') return priceInRupees > 10000;
        return true;
      });
    }

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'LowToHigh') return a.price - b.price;
    if (sortBy === 'HighToLow') return b.price - a.price;
    return new Date(b.createdAt) - new Date(a.createdAt); // Latest
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary mb-2">Shop Collection</h1>
          <p className="text-gray-600">Discover our authentic and premium range of Chaniya Cholis.</p>
        </div>
        <div className="mt-4 md:mt-0 relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="font-bold text-lg flex items-center"><Filter size={18} className="mr-2"/> Filters</h3>
              <button onClick={handleClearAll} className="text-sm text-primary hover:underline">Clear All</button>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center justify-between">
                Price <ChevronDown size={16}/>
              </h4>
              <div className="space-y-2">
                {['Under ₹2,000', '₹2,000 - ₹5,000', '₹5,000 - ₹10,000', 'Above ₹10,000'].map((price, i) => (
                  <label key={i} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded text-primary focus:ring-primary" 
                      checked={selectedPrices.includes(price)}
                      onChange={() => handlePriceChange(price)}
                    />
                    <span>{price}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-grow">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <span className="text-sm text-gray-500">Showing {filteredProducts.length} products</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary p-1"
            >
              <option value="Latest">Sort by Latest</option>
              <option value="LowToHigh">Sort by Price: Low to High</option>
              <option value="HighToLow">Sort by Price: High to Low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p>Loading products...</p>
            ) : sortedProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              sortedProducts.map((item, idx) => (
                <Link 
                  to={`/product/${item.id}`} 
                  key={item.id} 
                  className="card group block animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}
                >
                  <div className="relative h-72 overflow-hidden bg-gray-50">
                    <img 
                      src={item.images?.[0]?.url || `https://source.unsplash.com/random/400x500/?chaniya,choli,${item.id}`}
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    <button 
                      onClick={(e) => toggleWishlist(e, item.id)}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm text-gray-400 hover:text-red-500 z-20 transition"
                    >
                      <Heart size={18} />
                    </button>
                    <div className="absolute inset-0 z-10"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-md font-bold text-gray-800 mb-1 truncate group-hover:text-primary transition-colors">{item.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-primary text-lg">₹{(item.price / 100).toFixed(2)}</span>
                      <button className="text-xs bg-primary text-white px-3 py-1.5 rounded transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 group-hover:bg-primary-light">
                        View Details
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-12 flex justify-center space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-4 py-2 border rounded-md transition-colors ${page === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-600 hover:bg-primary hover:text-white'}`}
              >
                Prev
              </button>
              
              {[...Array(pages).keys()].map(x => (
                <button 
                  key={x + 1}
                  onClick={() => setPage(x + 1)}
                  className={`px-4 py-2 border rounded-md transition-colors ${page === x + 1 ? 'bg-primary text-white' : 'text-gray-600 hover:bg-primary hover:text-white'}`}
                >
                  {x + 1}
                </button>
              ))}

              <button 
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className={`px-4 py-2 border rounded-md transition-colors ${page === pages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-600 hover:bg-primary hover:text-white'}`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
