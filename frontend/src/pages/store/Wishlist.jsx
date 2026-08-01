import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Heart, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      fetchWishlist();
    }
  }, [userInfo, navigate]);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setWishlist(data.wishlist || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      await api.post(`/products/${id}/wishlist`);
      setWishlist(wishlist.filter(item => item.id !== id));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-heading font-bold text-primary mb-8 flex items-center">
        <Heart className="mr-3" fill="currentColor" /> My Wishlist
      </h1>

      {loading ? (
        <p>Loading your saved items...</p>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love here and buy them later.</p>
          <Link to="/shop" className="btn-primary inline-block">Explore Collection</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
              <Link to={`/product/${product.id}`} className="block relative h-64 overflow-hidden">
                <img 
                  src={product.images?.[0]?.url || `https://source.unsplash.com/random/400x500/?chaniya,choli,${product.id}`} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <div className="p-4 relative">
                <button 
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute -top-6 right-4 bg-white p-2 rounded-full shadow-md text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={20} />
                </button>
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                </Link>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-primary">₹{product.price}</span>
                  <Link to={`/product/${product.id}`} className="text-sm font-medium text-gray-600 hover:text-primary transition underline">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
