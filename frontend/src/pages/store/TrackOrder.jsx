import React, { useState } from 'react';
import { ShieldCheck, Phone, Truck, Hash, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const TrackOrder = () => {
  const [trackingMethod, setTrackingMethod] = useState('phone'); // 'phone' or 'order'
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (!inputValue) return;
    
    // Simply navigate to a mock tracking result page or show a toast
    // Currently, there's no backend for track-order for guest, 
    // so we can navigate to MyOrders if they are logged in, or show an error
    console.log('Tracking with', trackingMethod, inputValue);
  };

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
          <div className="flex p-1 rounded-lg bg-gray-50 border border-gray-200 mb-5">
            <button 
              type="button" 
              onClick={() => { setTrackingMethod('phone'); setInputValue(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${trackingMethod === 'phone' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-primary'}`}
            >
              <Phone className="w-4 h-4" /> Mobile Number
            </button>
            <button 
              type="button" 
              onClick={() => { setTrackingMethod('order'); setInputValue(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${trackingMethod === 'order' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-primary'}`}
            >
              <Hash className="w-4 h-4" /> Order Number
            </button>
          </div>

          <form onSubmit={handleTrack} className="space-y-3">
            <label className="block text-sm text-gray-600">
              {trackingMethod === 'phone' ? 'Mobile number used at checkout' : 'Order ID from your confirmation email'}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                {trackingMethod === 'phone' && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+91</span>
                )}
                <input 
                  type={trackingMethod === 'phone' ? 'tel' : 'text'}
                  placeholder={trackingMethod === 'phone' ? "96646 57688" : "e.g. ORD-12345678"} 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className={`w-full h-12 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${trackingMethod === 'phone' ? 'pl-12 pr-4' : 'px-4'}`}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="h-12 px-6 bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors sm:w-auto w-full disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!inputValue}
              >
                <Search className="w-5 h-5" />
                <span>Track</span>
              </button>
            </div>
            {trackingMethod === 'phone' && (
              <p className="text-xs text-gray-400">Tip: enter the same number you filled while placing the order.</p>
            )}
          </form>
        </div>

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
      </div>
    </div>
  );
};

export default TrackOrder;
