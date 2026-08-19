import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Truck, 
  Shield, 
  RefreshCw, 
  Heart, 
  Ruler, 
  MapPin, 
  Share2, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { addToCart } from '../../store/slices/cartSlice';
import SEO from '../../components/common/SEO';
import { FALLBACK_IMAGE, MAX_QUANTITY } from '../../utils/constants';

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

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({});

  // Size Guide Modal
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Delivery / Pincode Estimator
  const [pincode, setPincode] = useState(() => localStorage.getItem('shreeji_pincode') || '');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  // Link Copied State
  const [copiedLink, setCopiedLink] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo && id) {
      api.get('/auth/profile')
        .then(({ data }) => {
          setIsWishlisted(data.wishlist?.some(item => item.id === id) || false);
        })
        .catch(console.error);
    }
  }, [userInfo, id]);

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
      setActiveImageIndex(0);
    } catch {
      setError('Product not found or is unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  /**
   * Compute the final price using integer (paise) arithmetic to avoid
   * floating-point drift (e.g. 0.1 + 0.2 !== 0.3). Returns value in Rupees.
   */
  const computeFinalPrice = (basePricePaise, discountBasisPoints) => {
    const p = Number(basePricePaise) || 0;
    const d = Number(discountBasisPoints) || 0;
    const discountPaise = d > 0 ? Math.round(p * (d / 10000)) : 0;
    return (p - discountPaise) / 100;
  };

  const handleAddToCart = () => {
    if (!selectedColor && product?.colors?.length > 0) {
      return toast.error('Please select a color option');
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
      color: selectedColor || (product.colors?.[0]?.name || 'Standard'),
      quantity,
    }));
    toast.success('Added to cart!');
    navigate('/cart');
  };

  const toggleWishlist = async () => {
    if (!userInfo) return toast.error('Please login to save items to your wishlist');
    try {
      const { data } = await api.post(`/products/${id}/wishlist`);
      toast.success(data.message);
      setIsWishlisted(data.isWished);
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const decreaseQty = () => setQuantity(q => Math.max(1, q - 1));
  const increaseQty = () => setQuantity(q => Math.min(MAX_QUANTITY, product?.stock ?? MAX_QUANTITY, q + 1));

  // Pincode Delivery Estimator Check
  const handleCheckPincode = (e) => {
    e?.preventDefault();
    const cleanPin = pincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      return toast.error('Please enter a valid 6-digit Indian PIN code');
    }
    setCheckingPincode(true);
    setTimeout(() => {
      localStorage.setItem('shreeji_pincode', cleanPin);
      
      // Calculate estimated delivery date: 3 to 5 days from today
      const today = new Date();
      const minDate = new Date(today);
      minDate.setDate(today.getDate() + 3);
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 5);

      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      const dateRangeStr = `${minDate.toLocaleDateString('en-IN', options)} - ${maxDate.toLocaleDateString('en-IN', options)}`;

      setPincodeResult({
        pincode: cleanPin,
        deliveryDate: dateRangeStr,
        codAvailable: true,
        freeShipping: true,
      });
      setCheckingPincode(false);
    }, 400);
  };

  // WhatsApp Share Handler
  const handleWhatsAppShare = () => {
    const pageUrl = window.location.href;
    const text = `✨ Check out this gorgeous ${product.name} on Shreeji Fashion!\n\nPrice: ₹${finalPrice.toFixed(2)}\n\nExplore here: ${pageUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy Link Handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('Product link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) return <div className="container mx-auto py-20 text-center text-slate-500 font-medium animate-pulse">Loading product details...</div>;
  if (error || !product) return <div className="container mx-auto py-20 text-center text-red-500 font-medium">{error || 'Product not found.'}</div>;

  const finalPrice = computeFinalPrice(product.price, product.discount);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: (product.images || []).map((img) => img.url),
    description: product.description || `Shop authentic designer ${product.name} crafted in Surat. Premium ethnic fabric with detailed traditional handwork.`,
    sku: `SKU-${product.id.slice(-8).toUpperCase()}`,
    brand: {
      '@type': 'Brand',
      name: 'Shreeji Fashion',
    },
    offers: {
      '@type': 'Offer',
      url: `https://shreejifashion.vercel.app/product/${product.id}`,
      priceCurrency: 'INR',
      price: finalPrice.toFixed(2),
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Shreeji Fashion',
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <SEO
        title={`${product.name} | Designer Chaniya Choli Surat | Shreeji Fashion`}
        description={`Buy ${product.name} online at ₹${finalPrice.toFixed(2)}. Authentic Surat ethnic craftsmanship, ${product.stock > 0 ? 'in stock' : 'pre-order'} with worldwide delivery.`}
        keywords={`${product.name}, ${product.category} chaniya choli, buy ${product.name} online, surat ethnic wear, traditional lehenga`}
        ogType="product"
        ogImage={product.images?.[0]?.url || 'https://shreejifashion.vercel.app/og-image.jpg'}
        schema={productSchema}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-10 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">

          {/* Image Gallery */}
          <div className="space-y-4">
            <div 
              className="h-[480px] md:h-[540px] rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group relative cursor-crosshair shadow-sm"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={product.images?.[activeImageIndex]?.url || FALLBACK_IMAGE}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-200 ease-out"
                style={zoomStyle}
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-[#800020] to-[#500014] text-[#E5C158] font-bold text-xs uppercase px-3 py-1.5 rounded-full shadow-lg">
                  {product.discount / 100}% OFF
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shadow-xs ${
                      activeImageIndex === idx 
                        ? 'border-[#800020] ring-2 ring-[#800020]/20 opacity-100 scale-105' 
                        : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="text-xs font-bold text-[#800020] uppercase tracking-widest mb-1 font-mono">
              {product.category || 'Ethnic Collection'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mb-3 tracking-tight">
              {product.name}
            </h1>

            <div className="mb-5 flex items-baseline space-x-4">
              <span className="text-3xl sm:text-4xl font-bold text-[#800020]">
                ₹{finalPrice.toFixed(2)}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-lg text-slate-400 line-through">
                    ₹{(product.price / 100).toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Save ₹{((product.price / 100) - finalPrice).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <p className="text-slate-600 mb-6 text-sm leading-relaxed whitespace-pre-line border-b border-slate-100 pb-5">
              {product.description}
            </p>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Color: <span className="font-normal text-slate-900">{selectedColor || 'Choose'}</span>
                  </h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.name)}
                      className={`h-9 px-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                        selectedColor === color.name 
                          ? 'border-[#800020] bg-[#800020]/5 text-[#800020] ring-2 ring-[#800020]/20 shadow-xs' 
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: color.hexCode || color.name }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size & Size Guide Trigger */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Size: <span className="text-slate-900 font-semibold">{selectedSize} (Semi-Stitched)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs font-bold text-[#800020] hover:text-[#500014] flex items-center gap-1 hover:underline transition-all"
                >
                  <Ruler size={14} />
                  <span>View Size Guide</span>
                </button>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 flex items-center gap-2">
                <Sparkles size={15} className="text-[#800020] flex-shrink-0" />
                <span>Fits bust up to 42" and waist up to 40" with customizable margins.</span>
              </div>
            </div>

            {/* Stock indicator */}
            <div className="mb-5">
              {product.stock > 0 ? (
                <div className={`text-xs font-semibold flex items-center gap-1.5 ${product.stock <= 5 ? 'text-amber-600 font-bold' : 'text-emerald-700'}`}>
                  <span className={`w-2 h-2 rounded-full ${product.stock <= 5 ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                  {product.stock <= 5 ? `Hurry! Only ${product.stock} left in stock` : 'In Stock & Ready to Dispatch'}
                </div>
              ) : (
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Out of Stock
                </span>
              )}
            </div>

            {/* Actions (Quantity + Add to Cart + Wishlist) */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 mb-6">
              <div className="flex items-center border border-slate-200 bg-slate-50 rounded-xl w-32 h-12 flex-shrink-0 shadow-xs">
                <button 
                  onClick={decreaseQty} 
                  className="w-10 text-lg text-slate-600 hover:bg-slate-200/70 rounded-l-xl h-full flex items-center justify-center font-bold transition-colors"
                >
                  -
                </button>
                <span className="flex-1 text-center font-bold text-slate-900 text-sm">{quantity}</span>
                <button
                  onClick={increaseQty}
                  disabled={product.stock === 0 || quantity >= Math.min(MAX_QUANTITY, product.stock)}
                  className="w-10 text-lg text-slate-600 hover:bg-slate-200/70 rounded-r-xl h-full flex items-center justify-center font-bold disabled:opacity-30 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 h-12 text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                  product.stock > 0 
                    ? 'bg-gradient-to-r from-[#800020] to-[#500014] text-white hover:from-[#6b001b] hover:to-[#3e000f] shadow-[#800020]/20 active:scale-[0.99]' 
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Currently Unavailable'}
              </button>

              <button
                onClick={toggleWishlist}
                className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border rounded-xl shadow-xs active:scale-95 transition-all ${
                  isWishlisted 
                    ? 'text-rose-600 border-rose-300 bg-rose-50' 
                    : 'border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50'
                }`}
                title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Social Share & WhatsApp */}
            <div className="flex items-center gap-3 py-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Share2 size={13} /> Share:
              </span>
              <button
                onClick={handleWhatsAppShare}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition-colors flex items-center gap-1.5"
                title="Share via WhatsApp"
              >
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-colors flex items-center gap-1.5"
                title="Copy Product Link"
              >
                {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Pincode & Delivery Estimator */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={15} className="text-[#800020]" /> Check Delivery & COD
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Pan-India Courier</span>
              </div>

              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:ring-2 focus:ring-[#800020] outline-none"
                />
                <button
                  type="submit"
                  disabled={checkingPincode}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {checkingPincode ? 'Checking...' : 'Check'}
                </button>
              </form>

              {pincodeResult && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs animate-in fade-in duration-200">
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 size={14} /> Estimated Delivery: {pincodeResult.deliveryDate}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    ✓ Free Delivery on prepaid & COD orders over ₹5,000 | ₹500 Advance for COD
                  </p>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Truck size={16} className="text-[#800020] flex-shrink-0" />
                <span>Express Courier</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Shield size={16} className="text-[#800020] flex-shrink-0" />
                <span>100% Authentic Surat</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <RefreshCw size={16} className="text-[#800020] flex-shrink-0" />
                <span>7-Day Return Policy</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Size Guide Modal ── */}
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#800020]/10 text-[#800020] flex items-center justify-center font-bold">
                  <Ruler size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">Ethnic Wear Size & Measurement Guide</h3>
                  <p className="text-xs text-slate-500">Standard Semi-Stitched Chaniya Choli & Lehenga Specs</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Measurement Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Garment Part</th>
                    <th className="px-4 py-3">Standard Size</th>
                    <th className="px-4 py-3">Max Alterable Size</th>
                    <th className="px-4 py-3">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-900">Lehenga / Skirt</td>
                    <td className="px-4 py-3 text-slate-700">Waist: 32" - 38"</td>
                    <td className="px-4 py-3 text-slate-700">Up to 42"</td>
                    <td className="px-4 py-3 text-slate-700">42" - 44"</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-900">Choli / Blouse</td>
                    <td className="px-4 py-3 text-slate-700">Bust: 36" - 38"</td>
                    <td className="px-4 py-3 text-slate-700">Up to 42" (with 2" inside margins)</td>
                    <td className="px-4 py-3 text-slate-700">14.5" - 15.5"</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-900">Dupatta</td>
                    <td className="px-4 py-3 text-slate-700">Length: 2.30 to 2.50 Meters</td>
                    <td className="px-4 py-3 text-slate-700">Width: 38" - 42"</td>
                    <td className="px-4 py-3 text-slate-700">Full standard drape</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-900">Flair / Ghera</td>
                    <td className="px-4 py-3 text-slate-700">3.50 to 4.25 Meters full round</td>
                    <td className="px-4 py-3 text-slate-700">Can-can layer included</td>
                    <td className="px-4 py-3 text-slate-700">Heavy traditional flare</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* How to measure tips */}
            <div className="bg-amber-50/60 border border-amber-200/70 p-4 rounded-2xl space-y-2 text-xs text-amber-900">
              <h4 className="font-bold flex items-center gap-1.5">
                <Info size={15} className="text-amber-700" /> How to Measure for Best Fit:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-amber-800/90 leading-relaxed">
                <li><strong>Bust:</strong> Measure around the fullest part of your chest with a tape held level.</li>
                <li><strong>Waist:</strong> Measure around your natural waistline just above your navel.</li>
                <li><strong>Length:</strong> Measure from waistline down to the floor (wearing heels if planning to wear heels).</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowSizeGuide(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Got It, Close Guide
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
