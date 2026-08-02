import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Truck, Shield, RefreshCw, Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { addToCart } from '../../store/slices/cartSlice';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      if (data.sizes?.length > 0) setSelectedSize(data.sizes[0].name);
      if (data.colors?.length > 0) setSelectedColor(data.colors[0].name);
    } catch (error) {
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      return toast.error('Please select size and color');
    }
    dispatch(addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      image: product.images?.[0]?.url,
      price: product.price - (product.price * (product.discount / 100)),
      size: selectedSize,
      color: selectedColor,
      quantity
    }));
    toast.success('Added to cart!');
    navigate('/cart');
  };

  const toggleWishlist = async () => {
    if (!userInfo) return toast.error('Please login to use wishlist');
    try {
      const { data } = await api.post(`/products/${id}/wishlist`);
      toast.success(data.message);
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!userInfo) return toast.error('Please login to review');
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      toast.success('Review submitted successfully');
      setRating(5);
      setComment('');
      fetchProduct();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="container mx-auto py-20 text-center">Loading...</div>;
  if (!product) return <div className="container mx-auto py-20 text-center">Product not found.</div>;

  const finalPrice = product.price - (product.price * (product.discount / 100));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="h-[500px] rounded-lg overflow-hidden border border-gray-100 bg-gray-50 group">
              <img 
                src={product.images?.[0]?.url || `https://source.unsplash.com/random/600x800/?chaniya,choli,${product.id}`} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex text-secondary">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} fill={star <= (product.rating || 0) ? "currentColor" : "none"} className={star <= (product.rating || 0) ? "text-secondary" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
            </div>
            
            <div className="mb-6 flex items-end space-x-4">
              <span className="text-4xl font-bold text-primary">₹{finalPrice}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through mb-1">₹{product.price}</span>
                  <span className="text-sm font-bold text-green-600 mb-1 bg-green-100 px-2 py-1 rounded">{product.discount}% OFF</span>
                </>
              )}
            </div>
            
            <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Color</h4>
                <div className="flex space-x-3">
                  {product.colors.map((color) => (
                    <button 
                      key={color.id}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110 hover:shadow-md ${selectedColor === color.name ? 'border-primary scale-110 shadow-md' : 'border-gray-300'}`}
                      style={{backgroundColor: color.hexCode || color.name}}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Size</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button 
                      key={size.id}
                      onClick={() => setSelectedSize(size.name)}
                      className={`w-12 h-12 rounded flex items-center justify-center font-medium border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm ${selectedSize === size.name ? 'border-primary bg-primary text-white shadow-md' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            <div className="mb-4">
              {product.stock > 0 ? (
                <span className={`text-sm font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {product.stock <= 5 ? `Hurry! Only ${product.stock} left in stock` : `In Stock`}
                </span>
              ) : (
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded w-32 h-12">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 text-xl">-</button>
                <input type="text" value={quantity} readOnly className="w-full text-center outline-none font-bold" />
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 text-xl">+</button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 text-lg ${product.stock > 0 ? 'btn-primary' : 'bg-gray-400 text-white py-3 rounded cursor-not-allowed'}`}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button 
                onClick={toggleWishlist}
                className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded text-gray-400 hover:text-red-500 hover:border-red-500 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                title="Add to Wishlist"
              >
                <Heart size={24} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
              <div className="flex items-center text-gray-600 text-sm">
                <Truck size={18} className="mr-2 text-primary" /> Free Shipping in India
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Shield size={18} className="mr-2 text-primary" /> Secure Payment
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <RefreshCw size={18} className="mr-2 text-primary" /> 7 Days Return Policy
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Write a Review */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
            {userInfo ? (
              <form onSubmit={submitReviewHandler} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea 
                    required
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary"
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary">Submit Review</button>
              </form>
            ) : (
              <div className="bg-gray-50 p-4 rounded text-gray-600">
                Please <button onClick={() => navigate('/login')} className="text-primary font-bold underline">login</button> to write a review.
              </div>
            )}
          </div>

          {/* Review List */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Reviews ({product.numReviews})</h3>
            {product.reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <strong>{rev.user.name}</strong>
                    <div className="flex">
                      {[...Array(rev.rating)].map((_, i) => (
                         <Star key={i} size={14} fill="currentColor" className="text-secondary" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{new Date(rev.createdAt).toLocaleDateString()}</p>
                  <p className="text-gray-700">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
