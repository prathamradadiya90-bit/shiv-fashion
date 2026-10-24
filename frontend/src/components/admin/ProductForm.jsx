import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  UploadCloud, 
  Trash2, 
  ArrowLeft, 
  Plus, 
  Sparkles, 
  DollarSign, 
  Package, 
  Image as ImageIcon,
  Save,
  Check
} from 'lucide-react';
import api from '../../services/api';

export const PRESET_COLORS = [
  { name: 'Pure Noir Black', hexCode: '#111111' },
  { name: 'Bridal Crimson', hexCode: '#800020' },
  { name: 'Royal Velvet Blue', hexCode: '#1e3a8a' },
  { name: 'Emerald Artisan Green', hexCode: '#065f46' },
  { name: 'Heritage Gold', hexCode: '#D4AF37' },
  { name: 'Rani Rose Pink', hexCode: '#db2777' },
  { name: 'Mustard Festive Yellow', hexCode: '#ca8a04' },
  { name: 'Peacock Teal', hexCode: '#0f766e' },
  { name: 'Pristine Pearl White', hexCode: '#f8fafc' },
];

export const CATEGORIES = [
  { label: 'Bridal Collection', value: 'Bridal' },
  { label: 'Festive / Navratri', value: 'Festive' },
  { label: 'Party & Reception', value: 'Party' },
  { label: 'Designer Couture', value: 'Designer' },
  { label: 'Casual Ethnic', value: 'Casual' },
];

export const ProductForm = ({
  initialData = {},
  onSubmit,
  submitting = false,
  mode = 'add', // 'add' | 'edit'
}) => {
  const [name, setName] = useState(initialData.name || '');
  const [price, setPrice] = useState(
    initialData.price !== undefined ? (initialData.price / 100).toString() : ''
  );
  const [discount, setDiscount] = useState(
    initialData.discount !== undefined ? (initialData.discount / 100).toString() : '0'
  );
  const [description, setDescription] = useState(initialData.description || '');
  const [category, setCategory] = useState(initialData.category || 'Bridal');
  const [stock, setStock] = useState(
    initialData.stock !== undefined ? initialData.stock.toString() : '10'
  );
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData.isFeatured));
  const [isActive, setIsActive] = useState(
    initialData.isActive !== undefined ? Boolean(initialData.isActive) : true
  );

  const [images, setImages] = useState(initialData.images || []);
  const [uploading, setUploading] = useState(false);
  const [selectedColors, setSelectedColors] = useState(
    initialData.colors && initialData.colors.length > 0 
      ? initialData.colors 
      : [{ name: 'Pure Noir Black', hexCode: '#111111' }]
  );
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#000000');

  // Calculations
  const numericPrice = Number(price) || 0;
  const numericDiscount = Number(discount) || 0;
  const sellingPrice = Math.max(0, numericPrice - (numericPrice * numericDiscount / 100));

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
      if (selectedColors.length <= 1) {
        toast.info('Product should have at least one color option');
        return;
      }
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
    if (selectedColors.length <= 1) {
      toast.info('Product should have at least one color option');
      return;
    }
    setSelectedColors(selectedColors.filter(c => c.name !== colorName));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Product title is required');
    if (numericPrice <= 0) return toast.error('Valid base price is required');
    if (images.length === 0) return toast.error('Please upload at least one product image');

    onSubmit({
      name: name.trim(),
      price: numericPrice,
      discount: numericDiscount,
      description: description.trim(),
      category,
      stock: Number(stock) || 0,
      isFeatured,
      isActive,
      images,
      sizes: ['Free size (Semi-Stitched)'],
      colors: selectedColors,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/products" 
            className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 font-heading">
              {mode === 'add' ? 'Create New Lehenga / Product' : `Edit Product: ${name || 'Product Details'}`}
            </h2>
            <p className="text-xs text-neutral-500">
              {mode === 'add' 
                ? 'Fill details, pricing, colors, and imagery to publish to store' 
                : 'Modify catalog attributes, pricing, stock count, and gallery'}
            </p>
          </div>
        </div>

        <Link
          to="/admin/products"
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 underline underline-offset-4 hidden sm:block"
        >
          Cancel & Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Basic Information */}
        <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/80 p-6 md:p-8 space-y-5">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Package size={17} className="text-black" />
            <span>1. Product Information & Category</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. Noir Black & White Mirror Work Chaniya Choli with Gamthi Flare"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none cursor-pointer font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-3 sm:pt-6">
              <label className="relative flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500" /> Featured on Homepage
                  </span>
                  <span className="text-[10px] text-neutral-400">Showcase in highlights carousel</span>
                </div>
              </label>

              {mode === 'edit' && (
                <label className="relative flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-900">
                      {isActive ? 'Active in Storefront' : 'Archived (Hidden)'}
                    </span>
                    <span className="text-[10px] text-neutral-400">Toggle customer visibility</span>
                  </div>
                </label>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Description & Craft Details <span className="text-rose-500">*</span>
              </label>
              <textarea 
                required
                rows="4"
                placeholder="Describe fabric, flare length (ghera), dupatta work, blouse embroidery, can-can padding, and festive occasion styling..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Pricing & Live Calculation */}
        <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/80 p-6 md:p-8 space-y-5">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 pb-3">
            <DollarSign size={17} className="text-black" />
            <span>2. Pricing, Discount & Warehouse Stock</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Base MRP Price (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-neutral-400 font-bold">₹</span>
                <input 
                  type="number" 
                  step="0.01" 
                  required
                  placeholder="2999"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Promotional Discount (%)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0"
                  max="99"
                  placeholder="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none font-mono font-bold"
                />
                <span className="absolute right-4 top-3 text-neutral-400 font-bold">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Surat Warehouse Stock <span className="text-rose-500">*</span>
              </label>
              <input 
                type="number" 
                min="0"
                required
                placeholder="10"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none font-mono font-bold"
              />
            </div>
          </div>

          {/* Live Price Calculator Feedback Pill */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Live Customer Price:</span>
              <span className="text-xl font-bold text-neutral-950 font-mono">
                ₹{sellingPrice.toFixed(2)}
              </span>
            </div>
            {numericDiscount > 0 && (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Customer saves ₹{(numericPrice - sellingPrice).toFixed(2)} ({numericDiscount}% OFF)
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Color Variants */}
        <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/80 p-6 md:p-8 space-y-5">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                3. Color Shades & Fabrics
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">Click preset pills or enter a custom fabric shade</p>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
              {selectedColors.length} selected
            </span>
          </div>

          {/* Preset Color Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">Preset Popular Shades</label>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_COLORS.map((preset) => {
                const isSelected = selectedColors.some(c => c.name.toLowerCase() === preset.name.toLowerCase());
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => togglePresetColor(preset)}
                    className={`h-9 px-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                      isSelected 
                        ? 'border-black bg-black text-white shadow-xs scale-102' 
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs" 
                      style={{ backgroundColor: preset.hexCode }}
                    />
                    <span>{preset.name}</span>
                    {isSelected && <Check size={13} className="text-white ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Adder */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <input 
              type="text" 
              placeholder="Custom color name (e.g. Rust Orange)"
              value={customColorName}
              onChange={(e) => setCustomColorName(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-black outline-none w-60"
            />
            <input 
              type="color" 
              value={customColorHex}
              onChange={(e) => setCustomColorHex(e.target.value)}
              className="w-10 h-9 rounded-xl border border-neutral-200 cursor-pointer p-0.5 bg-white"
            />
            <button
              type="button"
              onClick={addCustomColor}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add Color
            </button>
          </div>

          {/* Active Colors List */}
          {selectedColors.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedColors.map((c) => (
                <span 
                  key={c.name} 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-medium border border-neutral-200"
                >
                  <span className="w-2.5 h-2.5 rounded-full border border-neutral-300" style={{ backgroundColor: c.hexCode }}></span>
                  {c.name}
                  <button 
                    type="button" 
                    onClick={() => removeColor(c.name)} 
                    className="text-neutral-400 hover:text-rose-500 ml-1 text-sm font-bold"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card 4: Multi-Image Gallery Manager */}
        <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/80 p-6 md:p-8 space-y-5">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={17} className="text-black" />
                <span>4. Product Imagery & Gallery</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">The first photo will be used as the primary cover</p>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
              {images.length} uploaded
            </span>
          </div>

          <div className="border-2 border-dashed border-neutral-200 hover:border-black rounded-2xl p-8 text-center bg-neutral-50/50 hover:bg-neutral-50 transition-all cursor-pointer relative">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={uploadFileHandler} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              disabled={uploading}
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black flex items-center justify-center">
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-800">Click or drag & drop to upload images</p>
                <p className="text-xs text-neutral-400">PNG, JPG, WEBP up to 5MB (Upload multiple for gallery)</p>
              </div>
              {uploading && (
                <div className="inline-flex items-center gap-2 text-xs font-bold text-neutral-900 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200">
                  <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
                  Uploading images to Cloudinary...
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Images Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 aspect-[3/4] shadow-xs">
                  <img src={img.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black text-white shadow-md">
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
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/admin/products"
            className="px-6 py-3 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-8 py-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {mode === 'add' ? <Plus size={16} /> : <Save size={16} />}
            <span>
              {submitting 
                ? (mode === 'add' ? 'Creating Product...' : 'Saving Changes...') 
                : (mode === 'add' ? 'Publish Product to Store' : 'Save Product Changes')}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
