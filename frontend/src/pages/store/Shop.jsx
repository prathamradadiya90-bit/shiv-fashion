import { useState, useEffect } from 'react';
import { Filter, ChevronDown, Search, Heart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import SEO from '../../components/common/SEO';
import { FALLBACK_IMAGE } from '../../utils/constants';

const Shop = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [sortBy, setSortBy] = useState('Latest');
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      api.get('/auth/profile')
        .then(({ data }) => {
          setWishlistIds(new Set(data.wishlist?.map(item => item.id) || []));
        })
        .catch(console.error);
    }
  }, [userInfo]);

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');

  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryParam, selectedPrices, sortBy]);

  const fetchProducts = async () => {
    const queryParamsObj = new URLSearchParams({ pageNumber: page });
    if (searchTerm) queryParamsObj.append('search', searchTerm);
    if (categoryParam) queryParamsObj.append('category', categoryParam);
    if (sortBy) queryParamsObj.append('sortBy', sortBy);

    if (selectedPrices.length > 0) {
      const ranges = selectedPrices.map(range => {
        if (range === 'Under ₹2,000') return '0-1999.99';
        if (range === '₹2,000 - ₹5,000') return '2000-5000';
        if (range === '₹5,000 - ₹10,000') return '5000.01-10000';
        if (range === 'Above ₹10,000') return '10000.01-';
        return '';
      }).filter(Boolean).join(',');
      queryParamsObj.append('priceRanges', ranges);
    }

    const { data } = await api.get(`/products?${queryParamsObj.toString()}`);
    return data;
  };

  const { data, isLoading: loading } = useQuery({
    queryKey: ['products', page, searchTerm, categoryParam, selectedPrices, sortBy],
    queryFn: fetchProducts,
    placeholderData: (previousData) => previousData,
  });

  const products = data?.products || data || [];
  const pages = data?.pages || 1;
  const total = data?.total || (data?.products ? data.products.length : data?.length) || 0;

  const toggleWishlist = async (e, id) => {
    e.preventDefault(); // Prevent navigating to product details
    if (!userInfo) return toast.error('Please login to use wishlist');
    try {
      const { data } = await api.post(`/products/${id}/wishlist`);
      toast.success(data.message);
      setWishlistIds(prev => {
        const newSet = new Set(prev);
        if (data.isWished) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update wishlist');
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

  // Client-side filtering and sorting replaced with server-side logic

  const shopSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoryParam ? `${categoryParam} Chaniya Choli Collection` : 'All Ethnic Wear & Chaniya Choli Collection',
    url: `https://chaniyacholinook.com/shop${categoryParam ? `?category=${encodeURIComponent(categoryParam)}` : ''}`,
    description: 'Browse authentic designer Chaniya Choli, Navratri festive lehenga, bridal collections, and Gujarati traditional wear with worldwide shipping.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://chaniyacholinook.com/' },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://chaniyacholinook.com/shop' },
        ...(categoryParam ? [{ '@type': 'ListItem', position: 3, name: categoryParam, item: `https://chaniyacholinook.com/shop?category=${encodeURIComponent(categoryParam)}` }] : []),
      ],
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title={categoryParam ? `${categoryParam} Chaniya Choli Collection | chaniyacholi.nook` : 'Shop Designer Chaniya Choli & Lehengas Online | chaniyacholi.nook'}
        description={`Explore ${categoryParam || 'exclusive'} designer Chaniya Cholis and ethnic lehengas. Tradition • Style • You with handcrafted luxury from Surat.`}
        keywords="chaniyacholi.nook, buy chaniya choli online, navratri lehenga shop, designer bridal choli, gujarati traditional attire, surat textile market online"
        schema={shopSchema}
      />
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-black mb-1">Exclusive Collection</h1>
          <p className="text-neutral-500 text-sm">Handcrafted designer Chaniya Cholis, Navratri attire & bridal ensembles.</p>
        </div>
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Search lehengas, silk, mirror work..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-sm text-sm focus:ring-1 focus:ring-black focus:border-black outline-none bg-neutral-50 focus:bg-white transition-all"
          />
          <Search className="absolute left-3.5 top-3 text-neutral-400" size={17} />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-3 text-neutral-400 hover:text-black text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Fast Category Filter Bar */}
      <div className="mb-6 pb-2 overflow-x-auto scrollbar-none flex items-center gap-2">
        {[
          { label: 'All Lehengas', value: null },
          { label: 'Bridal Collection', value: 'Bridal' },
          { label: 'Navratri & Festive', value: 'Festive' },
          { label: 'Party & Reception', value: 'Party' },
          { label: 'Artisan Designer', value: 'Designer' },
          { label: 'Ready-to-Wear', value: 'Casual' },
        ].map((tab) => {
          const isSelected = (!categoryParam && tab.value === null) || (categoryParam?.toLowerCase() === tab.value?.toLowerCase());
          return (
            <button
              key={tab.label}
              onClick={() => {
                if (tab.value === null) navigate('/shop');
                else navigate(`/shop?category=${encodeURIComponent(tab.value)}`);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border ${
                isSelected 
                  ? 'bg-black text-white border-black shadow-sm' 
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-black hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Filter Chips */}
      {(categoryParam || selectedPrices.length > 0 || searchTerm) && (
        <div className="mb-6 flex flex-wrap items-center gap-2 p-3 bg-neutral-50 rounded-md border border-neutral-200 text-xs">
          <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px]">Active Filters:</span>
          {categoryParam && (
            <button 
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-300 rounded-full font-medium hover:border-black"
            >
              <span>Category: <strong>{categoryParam}</strong></span>
              <span className="text-neutral-400 font-bold">✕</span>
            </button>
          )}
          {selectedPrices.map((p) => (
            <button 
              key={p}
              onClick={() => handlePriceChange(p)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-300 rounded-full font-medium hover:border-black"
            >
              <span>{p}</span>
              <span className="text-neutral-400 font-bold">✕</span>
            </button>
          ))}
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-300 rounded-full font-medium hover:border-black"
            >
              <span>Search: "{searchTerm}"</span>
              <span className="text-neutral-400 font-bold">✕</span>
            </button>
          )}
          <button 
            onClick={handleClearAll} 
            className="text-xs text-black font-bold underline hover:text-neutral-600 ml-auto"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Toggle Button */}
        <button 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden flex items-center justify-center w-full bg-white border border-gray-200 py-3 rounded-sm shadow-sm text-sm font-semibold text-gray-800"
        >
          <Filter size={18} className="mr-2" /> 
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Sidebar Filters */}
        <div className={`w-full md:w-64 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
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
            <span className="text-sm text-gray-500">Showing {total} products</span>
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
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card block animate-pulse border border-gray-100 shadow-sm rounded-lg overflow-hidden bg-white">
                  <div className="h-72 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-4 mt-1"></div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-3 bg-neutral-50 rounded-sm border border-neutral-200">
                <p className="font-heading text-xl text-black">No matching lehengas found</p>
                <p className="text-xs text-neutral-500">Try adjusting your filters or search keywords.</p>
                <button onClick={handleClearAll} className="btn-primary text-xs py-2 px-5">Reset All Filters</button>
              </div>
            ) : (
              products.map((item, idx) => (
                <Link 
                  to={`/product/${item.id}`} 
                  key={item.id} 
                  className="card group block animate-fade-in relative hover:shadow-xl transition-all duration-300 rounded-sm overflow-hidden border border-neutral-200 hover:border-black"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                    <img 
                      src={item.images?.[0]?.url || FALLBACK_IMAGE}
                      alt={item.name} 
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Discount badge */}
                    {item.discount > 0 && (
                      <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase z-20">
                        -{Math.round(item.discount / 100)}%
                      </span>
                    )}

                    <button 
                      onClick={(e) => toggleWishlist(e, item.id)}
                      className={`absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm z-20 transition hover:bg-black hover:text-white ${wishlistIds.has(item.id) ? 'text-black' : 'text-neutral-400'}`}
                      title={wishlistIds.has(item.id) ? "In Wishlist" : "Add to Wishlist"}
                    >
                      <Heart size={16} fill={wishlistIds.has(item.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{item.category}</p>
                    <h3 className="text-sm font-semibold text-black mb-1 truncate group-hover:text-neutral-600 transition-colors">{item.name}</h3>
                    <div className="flex justify-between items-center mt-2.5">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-black text-base">
                          ₹{(((item.price || 0) - Math.round((item.price || 0) * ((item.discount || 0) / 10000))) / 100).toFixed(2)}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-xs text-neutral-400 line-through">
                            ₹{((item.price || 0) / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-black group-hover:underline">
                        View Piece →
                      </span>
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
