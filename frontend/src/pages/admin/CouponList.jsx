import React, { useState, useEffect } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    value: 0,
    discountType: 'PERCENTAGE',
    minOrderValue: 0,
    expiryDate: ''
  });

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await api.get('/coupons');
        setCoupons(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const createCouponHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/coupons', {
        ...newCoupon,
        value: Number(newCoupon.value),
        minOrderValue: Number(newCoupon.minOrderValue)
      });
      setCoupons([data, ...coupons]);
      setShowModal(false);
      toast.success('Coupon created successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create coupon');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Coupons Management</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition flex items-center"
        >
          <Plus size={18} className="mr-2" /> Create Coupon
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4">Create New Coupon</h3>
            <form onSubmit={createCouponHandler} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input 
                  type="text" 
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({...newCoupon, value: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value (₹)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={newCoupon.minOrderValue}
                  onChange={(e) => setNewCoupon({...newCoupon, minOrderValue: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input 
                  type="date" 
                  required
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
                />
              </div>
              <button type="submit" className="w-full btn-primary mt-6">Create Coupon</button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading coupons...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Discount</th>
                  <th className="px-6 py-4 font-medium">Min Order</th>
                  <th className="px-6 py-4 font-medium">Expiry</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary tracking-wider">{coupon.code}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {coupon.discountType === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                    </td>
                    <td className="px-6 py-4 text-gray-600">₹{coupon.minOrderValue}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {coupon.isActive ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="text-red-600 hover:text-red-800 transition-colors"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this coupon?')) {
                            try {
                              await api.delete(`/coupons/${coupon.id}`);
                              setCoupons(coupons.filter(c => c.id !== coupon.id));
                            } catch (error) {
                              console.error(error);
                            }
                          }
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponList;
