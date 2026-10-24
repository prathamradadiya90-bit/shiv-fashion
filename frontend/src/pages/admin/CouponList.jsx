import { useState, useEffect } from 'react';
import { 
  Trash2, 
  Plus, 
  X, 
  Tag, 
  Copy, 
  Check, 
  Calendar, 
  Percent, 
  IndianRupee, 
  RefreshCw 
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import AdminHeader from '../../components/admin/AdminHeader';
import ConfirmModal from '../../components/admin/ConfirmModal';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  
  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
    toast.success(`Coupon code "${code}" copied!`);
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

  const confirmDeleteCoupon = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/coupons/${deleteTarget.id}`);
      setCoupons(coupons.filter(c => c.id !== deleteTarget.id));
      toast.success(`Coupon "${deleteTarget.code}" deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete coupon');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Unified Header */}
      <AdminHeader
        title="Promotional Coupons"
        subtitle="Create, configure, and monitor discount promo codes for festive campaigns and sales"
        badge={`${coupons.length} Active Codes`}
        breadcrumbs={['Marketing', 'Coupons']}
        action={
          <button 
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span>Create Promo Code</span>
          </button>
        }
      />

      {/* Coupons Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/80 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-neutral-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-black" />
            <span className="text-xs font-semibold">Loading active coupons...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-16 text-center text-neutral-500 space-y-3">
            <Tag size={40} className="mx-auto text-neutral-300 stroke-1" />
            <p className="text-sm font-bold text-neutral-800">No promo coupons configured yet</p>
            <p className="text-xs text-neutral-400">Click "Create Promo Code" to reward shoppers with percentage or flat discounts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50/80 text-neutral-400 text-[11px] uppercase tracking-wider font-semibold border-b border-neutral-100">
                <tr>
                  <th className="px-6 py-3.5">Promo Code</th>
                  <th className="px-6 py-3.5">Discount Value</th>
                  <th className="px-6 py-3.5">Min Order Requirement</th>
                  <th className="px-6 py-3.5">Expiry Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiryDate) < new Date();
                  return (
                    <tr key={coupon.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-950 bg-neutral-100 px-2.5 py-1 rounded-xl border border-neutral-200 text-xs tracking-wider">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="p-1 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
                            title="Copy code to clipboard"
                          >
                            {copiedCode === coupon.code ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-neutral-900 font-mono text-sm">
                        {coupon.discountType === 'PERCENTAGE' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            <Percent size={13} /> {coupon.value}% OFF
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                            <IndianRupee size={13} /> ₹{coupon.value} FLAT
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-neutral-600 font-mono">
                        {coupon.minOrderValue > 0 ? `₹${coupon.minOrderValue.toLocaleString('en-IN')}` : 'No Minimum'}
                      </td>

                      <td className="px-6 py-4 text-xs text-neutral-600 font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={13} className="text-neutral-400" />
                          {new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                          !isExpired && coupon.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {!isExpired && coupon.isActive ? 'Active' : 'Expired'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button 
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          onClick={() => setDeleteTarget({ id: coupon.id, code: coupon.code })}
                          title="Delete Coupon"
                        >
                          <Trash2 size={15} />
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

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative border border-neutral-100 space-y-4 animate-in zoom-in-95 duration-150">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-5 right-5 p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 text-black flex items-center justify-center">
                <Tag size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 font-heading">Create Promo Coupon</h3>
                <p className="text-xs text-neutral-400">Set discount percentage or flat amount and validity</p>
              </div>
            </div>

            <form onSubmit={createCouponHandler} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Coupon Code <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. NAVRATRI20, FESTIVE500"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider focus:bg-white focus:ring-2 focus:ring-black outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Discount Type</label>
                  <select 
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value})}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-black outline-none cursor-pointer font-medium"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Discount Value <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    placeholder={newCoupon.discountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 500'}
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({...newCoupon, value: e.target.value})}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-black outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Min Order Value (₹)
                </label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="0 for no minimum"
                  value={newCoupon.minOrderValue}
                  onChange={(e) => setNewCoupon({...newCoupon, minOrderValue: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-black outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Expiry Date <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="date" 
                  required
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-black outline-none cursor-pointer" 
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-neutral-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-bold hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 shadow-sm transition-all disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Coupon Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteCoupon}
        isLoading={deleting}
        title="Delete Promo Coupon?"
        message={`Are you sure you want to delete coupon code "${deleteTarget?.code}"? Shoppers will no longer be able to use it.`}
        confirmText="Yes, Delete Coupon"
        variant="danger"
      />
    </div>
  );
};

export default CouponList;
