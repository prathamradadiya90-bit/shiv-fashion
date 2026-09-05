import { useState, useEffect } from 'react';
import { Trash2, Plus, X, Tag, Copy, Check, Calendar, Percent, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    value: '',
    discountType: 'PERCENTAGE',
    minOrderValue: '0',
    expiryDate: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/coupons');
      setCoupons(data.coupons || []);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const createCouponHandler = async (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return toast.error('Coupon code is required');
    if (!newCoupon.value || Number(newCoupon.value) <= 0) return toast.error('Valid discount value is required');
    if (!newCoupon.expiryDate) return toast.error('Expiry date is required');

    setCreating(true);
    try {
      const { data } = await api.post('/coupons', {
        code: newCoupon.code.trim().toUpperCase(),
        discountType: newCoupon.discountType,
        value: Number(newCoupon.value),
        minOrderValue: Number(newCoupon.minOrderValue) || 0,
        expiryDate: newCoupon.expiryDate
      });
      setCoupons([data, ...coupons]);
      setShowModal(false);
      setNewCoupon({ code: '', value: '', discountType: 'PERCENTAGE', minOrderValue: '0', expiryDate: '' });
      toast.success('Coupon created successfully!');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create coupon');
    } finally {
      setCreating(false);
    }
  };

  const deleteCoupon = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons(coupons.filter(c => c.id !== id));
      toast.success('Coupon deleted');
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-heading">Discount Coupons</h2>
          <p className="text-xs text-slate-500">Create and manage promo codes for promotional campaigns</p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#5a0016] text-white text-xs font-bold hover:from-[#6b001b] hover:to-[#450011] shadow-md shadow-[#800020]/20 transition-all"
        >
          <Plus size={16} />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative border border-slate-100">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Tag size={18} className="text-[#800020]" />
              <span>Create Promo Coupon</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5">Set coupon code, discount rate, and minimum checkout conditions.</p>

            <form onSubmit={createCouponHandler} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Coupon Code <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. NAVRATRI20, FESTIVE500"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider focus:bg-white focus:ring-2 focus:ring-[#800020] outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Discount Type</label>
                  <select 
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-[#800020] outline-none cursor-pointer font-medium"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Discount Value <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    placeholder={newCoupon.discountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 500'}
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({...newCoupon, value: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#800020] outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Min Order Value (₹)
                </label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="0 for no minimum"
                  value={newCoupon.minOrderValue}
                  onChange={(e) => setNewCoupon({...newCoupon, minOrderValue: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-[#800020] outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Expiry Date <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="date" 
                  required
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-[#800020] outline-none cursor-pointer" 
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl bg-[#800020] text-white text-xs font-bold hover:bg-[#600018] shadow-md shadow-[#800020]/20 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">Loading active coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <Tag size={44} className="mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-semibold text-slate-600">No promo coupons yet</p>
            <p className="text-xs text-slate-400">Create your first coupon to reward shoppers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Promo Code</th>
                  <th className="px-6 py-4 font-semibold">Discount</th>
                  <th className="px-6 py-4 font-semibold">Min Order</th>
                  <th className="px-6 py-4 font-semibold">Valid Until</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiryDate) < new Date();
                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs tracking-wider">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {coupon.discountType === 'PERCENTAGE' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <Percent size={13} /> {coupon.value}% OFF
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-blue-700">
                            <IndianRupee size={13} /> ₹{coupon.value} OFF
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {coupon.minOrderValue > 0 ? `₹${coupon.minOrderValue.toLocaleString('en-IN')}` : 'No Minimum'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          {new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                          !isExpired && coupon.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {!isExpired && coupon.isActive ? 'Active' : 'Expired'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                          onClick={() => deleteCoupon(coupon.id, coupon.code)}
                          title="Delete Coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponList;
