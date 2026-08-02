import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import CheckoutSteps from './CheckoutSteps';
import api from '../../services/api';
import { clearCartItems } from '../../store/slices/cartSlice';
import { loadRazorpayScript } from '../../utils/razorpay';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCOD, setIsCOD] = useState(false);

  useEffect(() => {
    if (!cart.shippingAddress.street) {
      navigate('/shipping');
    }
  }, [cart.shippingAddress, navigate]);

  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  const cartPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  );
  
  const shippingPrice = addDecimals(cartPrice > 5000 ? 0 : 250); // Free shipping over 5000
  const taxPrice = addDecimals(Number((0.18 * cartPrice).toFixed(2))); // 18% GST

  // Calculate Discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = (cartPrice * (appliedCoupon.value / 100));
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const totalPrice = (
    Number(cartPrice) +
    Number(shippingPrice) +
    Number(taxPrice) -
    Number(discountAmount)
  ).toFixed(2);

  const applyCouponHandler = async () => {
    if (!couponCode) return;
    try {
      const { data } = await api.post('/coupons/apply', {
        code: couponCode.toUpperCase(),
        orderValue: cartPrice
      });
      setAppliedCoupon({
        code: data.code,
        discountType: data.discountType,
        value: data.value
      });
      toast.success(`Coupon ${data.code} applied!`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Invalid Coupon');
      setAppliedCoupon(null);
    }
  };



  const placeOrderHandler = async () => {
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const orderData = {
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        totalAmount: Number(totalPrice),
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        isCOD,
      };

      // 1. Create order on server
      const { data } = await api.post('/orders', orderData);

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TKUQLqqkzetbPC', // Fallback to provided test key
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: 'Shreeji Fashion',
        description: 'Premium Chaniya Choli',
        order_id: data.razorpayOrder.id,
        callback_url: `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/payment-callback`,
        redirect: false, // Ensures SPA behavior on desktop, but redirects on mobile UPI intents
        handler: async function (response) {
          try {
            // 3. Verify Payment on server
            await api.post(`/orders/${data.order.id}/pay`, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            
            toast.success('Order Placed Successfully!');
            dispatch(clearCartItems());
            navigate(`/order/${data.order.id}`);
          } catch (error) {
            toast.error(error?.response?.data?.message || 'Payment Verification Failed');
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.phone || '',
        },
        theme: {
          color: '#800020',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to place order');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps step1 step2 step3 />
      
      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        {/* Order Details */}
        <div className="flex-grow space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Shipping Details</h2>
            <p className="text-gray-600">
              <strong>Address:</strong> {cart.shippingAddress.street}, {cart.shippingAddress.city}, {cart.shippingAddress.state} {cart.shippingAddress.zipCode}, {cart.shippingAddress.country}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Order Items</h2>
            {cart.cartItems.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.cartItems.map((item, index) => (
                  <div key={index} className="py-3 flex items-center">
                    <img src={item.image || `https://source.unsplash.com/random/50x60/?chaniya,choli,${item.id}`} alt={item.name} className="w-12 h-16 object-cover rounded mr-4" />
                    <div className="flex-grow">
                      <Link to={`/product/${item.id}`} className="font-bold text-gray-800 hover:text-primary">
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500">Size: {item.size} | Color: {item.color}</p>
                    </div>
                    <div className="font-medium text-gray-700">
                      {item.quantity} x ₹{item.price} = ₹{(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Order Summary</h2>
            
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Items</span>
                <span>₹{cartPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shippingPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST 18%)</span>
                <span>₹{taxPrice}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{addDecimals(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3 mt-3 text-lg font-bold text-gray-900">
                <span>Total</span>
                <span className="text-primary">₹{totalPrice}</span>
              </div>
              
              {isCOD && (
                <div className="flex justify-between border-t pt-3 mt-3 text-sm font-bold text-blue-800 bg-blue-50 p-2 rounded">
                  <span>Advance Payment (COD)</span>
                  <span>₹500.00</span>
                </div>
              )}
            </div>

            <div className="mb-6 space-y-3">
              <label className="font-bold text-gray-800 block text-sm mb-2">Select Payment Method:</label>
              
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${!isCOD ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  checked={!isCOD} 
                  onChange={() => setIsCOD(false)}
                  className="mr-3 w-4 h-4 text-primary"
                />
                <span className="font-medium text-gray-800 text-sm">Pay Full Amount (Prepaid)</span>
              </label>

              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${isCOD ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  checked={isCOD} 
                  onChange={() => setIsCOD(true)}
                  className="mr-3 w-4 h-4 text-primary"
                />
                <span className="font-medium text-gray-800 text-sm flex flex-col">
                  <span>Cash on Delivery</span>
                  <span className="text-xs text-gray-500 mt-0.5">Pay ₹500 advance now to confirm order. Remaining on delivery.</span>
                </span>
              </label>
            </div>

            <div className="mb-6 flex space-x-2">
              <input 
                type="text" 
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-grow border-gray-300 rounded shadow-sm p-2 text-sm focus:ring-primary focus:border-primary border"
              />
              <button 
                onClick={applyCouponHandler}
                className="bg-gray-800 text-white px-4 rounded text-sm hover:bg-black transition"
              >
                Apply
              </button>
            </div>

            <button
              type="button"
              onClick={placeOrderHandler}
              disabled={cart.cartItems.length === 0}
              className={`w-full btn-primary text-lg py-3 ${cart.cartItems.length === 0 && 'opacity-50 cursor-not-allowed'}`}
            >
              Pay {isCOD ? '₹500 Advance' : `₹${totalPrice}`}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              100% Secure Payments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
