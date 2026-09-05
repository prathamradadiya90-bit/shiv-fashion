import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  UploadCloud, 
  Trash2, 
  ArrowLeft, 
  Sparkles, 
  Check, 
  DollarSign, 
  Package, 
  Image as ImageIcon,
  Save,
  Plus
} from 'lucide-react';
import api from '../../services/api';

const PRESET_COLORS = [
  { name: 'Maroon', hexCode: '#800020' },
  { name: 'Royal Blue', hexCode: '#1e3a8a' },
  { name: 'Emerald Green', hexCode: '#065f46' },
  { name: 'Gold', hexCode: '#D4AF37' },
  { name: 'Rani Pink', hexCode: '#db2777' },
  { name: 'Mustard Yellow', hexCode: '#ca8a04' },
  { name: 'Peacock Teal', hexCode: '#0f766e' },
  { name: 'Classic Black', hexCode: '#18181b' },
];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Bridal');
  const [stock, setStock] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#800020');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setName(data.name || '');
        setPrice(data.price ? String(data.price / 100) : '');
        setDiscount(data.discount !== undefined ? String(data.discount / 100) : '0');
        setDescription(data.description || '');
        setCategory(data.category || 'Bridal');
        setStock(String(data.stock ?? 0));
        setIsFeatured(Boolean(data.isFeatured));
        setIsActive(Boolean(data.isActive));

        if (data.colors && Array.isArray(data.colors)) {
          setSelectedColors(data.colors);
        }
        if (data.images && Array.isArray(data.images)) {
          setImages(data.images);
        }
      } catch {
        toast.error('Product not found');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const numericPrice = Number(price) || 0;
  const numericDiscount = Number(discount) || 0;
  const finalPrice = Math.max(0, numericPrice - (numericPrice * numericDiscount / 100));

  const uploadFileHandler = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        const { data } = await api.post('/upload', formData, config);
        setImages(prev => [...prev, { url: data.url, publicId: data.publicId }]);
      }
      toast.success('Image(s) uploaded successfully');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const togglePresetColor = (preset) => {
    const exists = selectedColors.find(c => c.name.toLowerCase() === preset.name.toLowerCase());
    if (exists) {
      setSelectedColors(selectedColors.filter(c => c.name.toLowerCase() !== preset.name.toLowerCase()));
    } else {
      setSelectedColors([...selectedColors, preset]);
    }
  };

  const addCustomColor = (e) => {
    e.preventDefault();
    if (!customColorName.trim()) return;
    if (selectedColors.some(c => c.name.toLowerCase() === customColorName.trim().toLowerCase())) {
      toast.info('Color already added');
      return;
    }
    setSelectedColors([...selectedColors, { name: customColorName.trim(), hexCode: customColorHex }]);
    setCustomColorName('');
  };

  const removeColor = (colorName) => {
    setSelectedColors(selectedColors.filter(c => c.name !== colorName));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Product name is required');
    if (numericPrice <= 0) return toast.error('Valid price is required');
    if (images.length === 0) return toast.error('Please keep at least one product image');

    setSubmitting(true);
    try {
      await api.put(`/products/${id}`, {
        name: name.trim(),
        price: numericPrice,
        discount: numericDiscount,
        description: description.trim(),
        category,
        stock: Number(stock) || 0,
        isFeatured,
        isActive,
        images,
        sizes: ['Free size'],
        colors: selectedColors,
      });
      toast.success('Product updated successfully!');
      navigate('/admin/products');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400 animate-pulse">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/products" 
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">Edit Product</h2>
            <p className="text-xs text-slate-500">Update catalog design and inventory specifications</p>
          </div>
        </div>
      </div>

      <form onSubmit={submitHandler} className="space-y-6">
        {/* Card 1: Basic Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Package size={18} className="text-[#800020]" />
            <span>Product Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#800020] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#800020] focus:border-transparent outline-none transition-all cursor-pointer font-medium"
              >
                <option value="Bridal">Bridal Collection</option>
                <option value="Festive">Festive / Navratri</option>
                <option value="Party">Party Wear</option>
                <option value="Designer">Designer Couture</option>
                <option value="Casual">Casual Ethnic</option>
              </select>
            </div>

            <div className="flex items-center gap-6 pt-6">
              <label className="relative flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#800020]"></div>
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" /> Featured
                </span>
              </label>

              <label className="relative flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="text-sm font-bold text-slate-800">
                  {isActive ? 'Active in Store' : 'Archived (Hidden)'}
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Description & Craft Details <span className="text-rose-500">*</span>
              </label>
              <textarea 
                required
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-[#800020] focus:border-transparent outline-none transition-all leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Pricing & Live Calculation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <DollarSign size={18} className="text-emerald-600" />
            <span>Pricing & Inventory</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Base Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="number" 
                required
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Discount (%)
              </label>
              <input 
                type="number" 
                min="0"
                max="99"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Stock Quantity (Units) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="number" 
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all font-semibold"
              />
            </div>
          </div>

          {/* Live Price Preview */}
          {numericPrice > 0 && (
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Customer Selling Price</p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Base ₹{numericPrice.toLocaleString('en-IN')} {numericDiscount > 0 ? `with ${numericDiscount}% discount` : '(No discount applied)'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-emerald-800">
                  ₹{Math.round(finalPrice).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Color Palette Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-amber-500"></span>
            <span>Color Palette & Variations</span>
          </h3>

          <div>
            <p className="text-xs font-semibold text-slate-500 mb-3">Quick preset colors (Click to toggle):</p>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_COLORS.map((preset) => {
                const isSelected = selectedColors.some(c => c.name.toLowerCase() === preset.name.toLowerCase());
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => togglePresetColor(preset)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full border border-black/10" 
                      style={{ backgroundColor: preset.hexCode }} 
                    />
                    <span>{preset.name}</span>
                    {isSelected && <Check size={13} className="text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <input 
              type="text" 
              placeholder="Custom color name"
              value={customColorName}
              onChange={(e) => setCustomColorName(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-[#800020] outline-none w-60"
            />
            <input 
              type="color" 
              value={customColorHex}
              onChange={(e) => setCustomColorHex(e.target.value)}
              className="w-10 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
            />
            <button
              type="button"
              onClick={addCustomColor}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add Color
            </button>
          </div>

          {selectedColors.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedColors.map((c) => (
                <span 
                  key={c.name} 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium"
                >
                  <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: c.hexCode }}></span>
                  {c.name}
                  <button type="button" onClick={() => removeColor(c.name)} className="text-slate-400 hover:text-rose-500 ml-1">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card 4: Multi-Image Gallery Manager */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ImageIcon size={18} className="text-blue-600" />
            <span>Product Imagery & Gallery</span>
          </h3>

          <div className="border-2 border-dashed border-slate-200 hover:border-[#800020]/50 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer relative">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={uploadFileHandler} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              disabled={uploading}
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-[#800020]/10 text-[#800020] flex items-center justify-center">
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Click or drag & drop to upload new images</p>
                <p className="text-xs text-slate-400">PNG, JPG, WEBP up to 5MB</p>
              </div>
              {uploading && (
                <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                  Uploading images to Cloudinary...
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Images Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[3/4]">
                  <img src={img.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#800020] text-white shadow-md">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 shadow-md"
                    title="Remove image"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <Link
            to="/admin/products"
            className="px-6 py-3.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#5a0016] text-white text-sm font-bold hover:from-[#6b001b] hover:to-[#450011] shadow-lg shadow-[#800020]/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {submitting ? 'Saving Changes...' : 'Save Product Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
