import React, { useState } from 'react';
import { ShieldCheck, Phone, Truck, Hash, Search, Package, CheckCircle, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const TrackOrder = () => {
  const [trackingMethod, setTrackingMethod] = useState('phone'); // 'phone' or 'order'
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!inputValue) return;
    
    try {
      setLoading(true);
      setOrders(null);
      
      const { data } = await api.post('/orders/track', {
        type: trackingMethod === 'phone' ? 'mobile' : 'orderId',
        value: inputValue
      });
      
      setOrders(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'CONFIRMED': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  const statusList = [
    { id: 1, name: 'Order Placed', icon: Package },
    { id: 2, name: 'Confirmed', icon: CheckCircle },
    { id: 3, name: 'Shipped', icon: Truck },
    { id: 4, name: 'Delivered', icon: MapPin },
  ];

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-primary/5 via-white to-primary/5 pb-16">
      <div className="relative overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(123,30,30,0.05),_transparent_60%)]"></div>
        <div className="relative max-w-3xl mx-auto px-4 pt-10 pb-8 md:pt-14 md:pb-10 text-center">
          <p className="text-primary font-medium tracking-[0.2em] uppercase text-xs mb-3">Order Status</p>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-gray-800 mb-3">Track Your Order</h1>
          <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            No login needed. Use the mobile number from checkout, or your order number — and see every update in one place.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Secure lookup
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" /> Phone or order ID
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-primary" /> Live status
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-10">
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] p-5 md:p-7 mb-8">
          
          {/* Custom Tabs to match image */}
          <div className="flex p-1 rounded-lg border border-gray-200 mb-6 bg-white overflow-hidden max-w-lg">
            <button 
              type="button" 
              onClick={() => { setTrackingMethod('phone'); setInputValue(''); setOrders(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-medium transition-all ${trackingMethod === 'phone' ? 'bg-[#800020] text-white shadow-sm' : 'text-gray-600 hover:text-[#800020]'}`}
            >
              <Phone className="w-4 h-4" /> Mobile Number
            </button>
            <button 
              type="button" 
              onClick={() => { setTrackingMethod('order'); setInputValue(''); setOrders(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-medium transition-all ${trackingMethod === 'order' ? 'bg-[#800020] text-white shadow-sm' : 'text-gray-600 hover:text-[#800020]'}`}
            >
              <Hash className="w-4 h-4" /> Order Number
            </button>
          </div>

          <form onSubmit={handleTrack} className="space-y-3">
            <label className="block text-sm text-gray-600 font-medium">
              {trackingMethod === 'phone' ? 'Mobile number used at checkout' : 'Order ID from your confirmation email'}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                {trackingMethod === 'phone' && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base font-medium">+91</span>
                )}
                <input 
                  type={trackingMethod === 'phone' ? 'tel' : 'text'}
                  placeholder={trackingMethod === 'phone' ? "7046932548" : "e.g. 9b1deb4d-3b7d..."} 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className={`w-full h-14 rounded-lg border border-gray-200 focus:border-[#800020] focus:ring-1 focus:ring-[#800020] outline-none transition-colors text-lg ${trackingMethod === 'phone' ? 'pl-14 pr-4' : 'px-4'}`}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="h-14 px-8 bg-[#800020] hover:bg-[#600018] text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors sm:w-auto w-full disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                disabled={!inputValue || loading}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Track</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 pt-2">
              Tip: {trackingMethod === 'phone' ? 'enter the same number you filled while placing the order.' : 'check your confirmation email for the order number.'}
            </p>
          </form>
        </div>

        {/* Tracking Results Area */}
        {orders && orders.length > 0 && (
          <div className="space-y-8 animate-fade-in-up mt-10">
            <h2 className="text-2xl font-serif text-gray-800 border-b pb-2">Tracking Results</h2>
            
            {orders.map((order) => {
              const currentStep = getStatusStep(order.status);
              
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                      <p className="font-mono font-bold text-gray-800">{order.id}</p>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
                        <p className="font-medium text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                        <p className="font-bold text-[#800020]">₹{order.totalAmount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    
                    {/* Visual Timeline */}
                    <div className="mb-12 relative max-w-2xl mx-auto">
                      {/* Connecting Line Background */}
                      <div className="absolute top-6 left-10 right-10 h-1 bg-gray-200 -z-10 hidden sm:block"></div>
                      
                      {/* Active Connecting Line */}
                      <div 
                        className="absolute top-6 left-10 h-1 bg-green-500 -z-10 hidden sm:block transition-all duration-1000"
                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                      ></div>

                      <div className="flex justify-between relative">
                        {statusList.map((step, index) => {
                          const isCompleted = currentStep >= step.id;
                          const isCurrent = currentStep === step.id;
                          const StepIcon = step.icon;
                          
                          return (
                            <div key={step.id} className="flex flex-col items-center relative z-10 w-1/4">
                              <div 
                                className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-500 shadow-sm
                                  ${isCompleted ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'}
                                  ${isCurrent && 'ring-4 ring-green-500/20 shadow-md'}
                                `}
                              >
                                <StepIcon size={20} />
                              </div>
                              <span className={`text-xs md:text-sm font-bold text-center ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                {step.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tracking Info (If Shipped) */}
                    {order.trackingNumber && (
                      <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl mb-8 flex items-center gap-3">
                        <Truck size={24} className="text-blue-500" />
                        <div>
                          <p className="font-bold text-sm">Shipment Tracking Number</p>
                          <p className="font-mono text-lg">{order.trackingNumber}</p>
                        </div>
                      </div>
                    )}

                    {/* Order Items Summary */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Items in this order</h4>
                      <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={item.image || `https://source.unsplash.com/random/100x100/?fashion,lehenga,${idx}`} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow">
                              <p className="font-bold text-gray-800 line-clamp-1">{item.name}</p>
                              <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} | Size: {item.size} | Color: {item.color}</p>
                              <p className="text-sm font-bold text-[#800020] mt-1">₹{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Benefits text below the tracking box */}
        {!orders && (
          <div className="grid sm:grid-cols-3 gap-4 mt-2">
            <div className="rounded-lg border border-gray-100 bg-white p-5 text-center shadow-sm">
              <p className="font-semibold text-gray-800 text-sm mb-2">Guest friendly</p>
              <p className="text-xs text-gray-500 leading-relaxed">Track without creating an account</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-white p-5 text-center shadow-sm">
              <p className="font-semibold text-gray-800 text-sm mb-2">Same phone = all orders</p>
              <p className="text-xs text-gray-500 leading-relaxed">Every order under that number shows up</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-white p-5 text-center shadow-sm">
              <p className="font-semibold text-gray-800 text-sm mb-2">Later signup</p>
              <p className="text-xs text-gray-500 leading-relaxed">Sign up with same number — orders auto-link</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
