import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

export const QuickEditStockModal = ({
  product,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [price, setPrice] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [stock, setStock] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setPrice((product.price / 100).toFixed(2));
      setDiscount(product.discount ? (product.discount / 100).toString() : '0');
      setStock(product.stock !== undefined ? product.stock.toString() : '0');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;


  const numPrice = Number(price) || 0;
  const numDiscount = Number(discount) || 0;
  const sellingPrice = Math.max(0, numPrice - (numPrice * numDiscount / 100));

  const handleSave = async (e) => {
    e.preventDefault();
    if (numPrice <= 0) return toast.error('Base price must be greater than 0');
    if (Number(stock) < 0) return toast.error('Stock cannot be negative');

    setLoading(true);
    try {
      // Send partial update
      const { data } = await api.put(`/products/${product.id}`, {
        price: numPrice,
        discount: numDiscount,
        stock: Number(stock),
      });

      toast.success(`Updated "${product.name}" stock & price`);
      onUpdated(data);
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 relative space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Quick Inventory Edit</span>
          <h3 className="text-base font-bold text-neutral-900 font-heading truncate mt-0.5">{product.name}</h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Base Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="99"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-medium">Customer Selling Price:</span>
            <span className="font-bold text-neutral-950 font-mono text-sm">₹{sellingPrice.toFixed(2)}</span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Stock Units in Surat Warehouse
            </label>
            <input
              type="number"
              min="0"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-black outline-none"
            />
            {Number(stock) === 0 && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle size={12} /> Product will display as "Out of Stock"
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 border border-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save size={14} />
              <span>{loading ? 'Saving...' : 'Update Inventory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickEditStockModal;
