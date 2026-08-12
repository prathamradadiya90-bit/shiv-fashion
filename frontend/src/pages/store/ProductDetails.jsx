import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Truck, Shield, RefreshCw, Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { addToCart } from '../../store/slices/cartSlice';

const MAX_QUANTITY = 20; // mirrors backend MAX_ITEM_QUANTITY constant

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize] = useState('Free size');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    setError(null);
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      if (data.colors?.length > 0) setSelectedColor(data.colors[0].name);
    } catch {
      setError('Product not found or is unavailable.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Compute the final price using integer (paise) arithmetic to avoid
   * floating-point drift (e.g. 0.1 + 0.2 !== 0.3).
   */
  const computeFinalPrice = (basePricePaise, discountBasisPoints) => {
    const p = Number(basePricePaise) || 0;
    const d = Number(discountBasisPoints) || 0;
    const discountPaise = d > 0 ? Math.round(p * (d / 10000)) : 0;
    return (p - discountPaise) / 100;
  };

  const handleAddToCart = () => {
    if (!userInfo) {
      toast.error('Please login to add items to cart');
      return navigate(`/login?redirect=${encodeURIComponent(`/product/${id}`)}`);
    }
    if (!selectedColor) {
      return toast.error('Please select a color');
    }
    if (quantity < 1 || quantity > MAX_QUANTITY) {
      return toast.error(`Quantity must be between 1 and ${MAX_QUANTITY}`);
    }

    const finalPrice = computeFinalPrice(product.price, product.discount);

    dispatch(addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      image: product.images?.[0]?.url,
      price: finalPrice,
      size: selectedSize,
      color: selectedColor,
      quantity,
    }));
    toast.success('Added to cart!');
    navigate('/cart');
  };

  const toggleWishlist = async () => {
    if (!userInfo) return toast.error('Please login to use wishlist');
    try {
      const { data } = await api.post(`/products/${id}/wishlist`);
      toast.success(data.message);
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const decreaseQty = () => setQuantity(q => Math.max(1, q - 1));
  const increaseQty = () => setQuantity(q => Math.min(MAX_QUANTITY, product?.stock ?? MAX_QUANTITY, q + 1));

  if (loading) return <div className="container mx-auto py-20 text-center">Loading...</div>;
  if (error || !product) return <div className="container mx-auto py-20 text-center text-red-500">{error || 'Product not found.'}</div>;

  const finalPrice = computeFinalPrice(product.price, product.discount);

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

            <div className="mb-6 mt-4 flex items-end space-x-4">
              <span className="text-4xl font-bold text-primary">₹{finalPrice.toFixed(2)}</span>
              {product.discount > 0 && (
                <span className="text-lg text-gray-400 line-through">₹{(product.price / 100).toFixed(2)}</span>
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
                      style={{ backgroundColor: color.hexCode || color.name }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            <div className="mb-4">
              {product.stock > 0 ? (
                <span className={`text-sm font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {product.stock <= 5 ? `Hurry! Only ${product.stock} left in stock` : 'In Stock'}
                </span>
              ) : (
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded w-32 h-12">
                <button onClick={decreaseQty} className="px-3 text-xl text-gray-600 hover:bg-gray-100 rounded-l h-full">-</button>
                <span className="flex-1 text-center font-bold">{quantity}</span>
                <button
                  onClick={increaseQty}
                  disabled={product.stock === 0 || quantity >= Math.min(MAX_QUANTITY, product.stock)}
                  className="px-3 text-xl text-gray-600 hover:bg-gray-100 rounded-r h-full disabled:opacity-40"
                >+</button>
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
    </div>
  );
};

export default ProductDetails;
