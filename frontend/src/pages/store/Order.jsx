import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle, Truck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { loadRazorpayScript } from '../../utils/razorpay';

const Order = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const payNowHandler = async () => {
    try {
      setIsPaying(true);
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsPaying(false);
        return;
      }

      // 1. Generate new Razorpay order ID or fetch existing
      const { data } = await api.post(`/orders/${id}/retry-pay`);

      // 2. Open Razorpay Checkout
      // NOTE: Do NOT set callback_url — it causes a hard page redirect which loses
      // the browser session (cookies not re-sent on redirect) and triggers the
      // 401 interceptor → auto-logout. Use only the handler function for the SPA flow.
      const { data: config } = await api.get('/config/razorpay');
      if (!config || !config.keyId) {
        toast.error('Razorpay key is not configured');
        setIsPaying(false);
        return;
      }

      const options = {
        key: config.keyId,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: 'Shreeji Fashion',
        description: 'Order Payment',
        order_id: data.razorpayOrder.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            await api.post(`/orders/${id}/pay`, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            
            toast.success('Payment Successful!');
            // Refresh order
            const { data: updatedOrder } = await api.get(`/orders/${id}`);
            setOrder(updatedOrder);
          } catch (error) {
            toast.error(error?.response?.data?.message || 'Payment Verification Failed');
          }
        },
        prefill: {
          name: userInfo?.name || order.user?.name || '',
          email: userInfo?.email || order.user?.email || '',
          contact: userInfo?.phone || '',
        },
        theme: {
          color: '#800020',
        },
        modal: {
          ondismiss: function () {
            toast.info('Payment cancelled. You can retry anytime from this page.');
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading order...</div>;
  if (!order) return <div className="text-center py-20 text-red-500 font-bold">Order Not Found</div>;

  const isPaid = order.paymentStatus === 'PAID';
  const isCancelledOrFailed = order.status === 'CANCELLED' || order.paymentStatus === 'FAILED';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Banner based on actual payment status */}
      {isPaid ? (
        <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl flex items-center mb-8">
          <CheckCircle size={32} className="mr-4 text-green-500 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold">Order Confirmed</h2>
            <p>Thank you for your purchase! Your order ID is <strong>{order.id}</strong></p>
          </div>
        </div>
      ) : isCancelledOrFailed ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl flex items-center mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h2 className="text-xl font-bold">{order.status === 'CANCELLED' ? 'Order Cancelled' : 'Payment Failed'}</h2>
            <p>Your order ID is <strong>{order.id}</strong>. Please contact support if you need help.</p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-xl flex items-center mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-4 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h2 className="text-xl font-bold">Payment Pending</h2>
            <p>Your order ID is <strong>{order.id}</strong>. Please complete payment to confirm your order.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 pb-2 border-b">Shipping Summary</h3>
          <p><strong>Status:</strong> <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold uppercase">{order.status}</span></p>
          {order.trackingNumber && (
            <p className="mt-2 text-primary"><strong>Tracking No:</strong> {order.trackingNumber}</p>
          )}
          <p className="mt-2"><strong>Address:</strong> {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 pb-2 border-b">Payment Summary</h3>
          <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{order.paymentStatus}</span></p>
          <p className="mt-2"><strong>Total Amount:</strong> <span className="font-bold text-primary">₹{(order.totalAmount / 100).toFixed(2)}</span></p>
          {order.paymentStatus === 'UNPAID' && (
            <button
              type="button"
              onClick={payNowHandler}
              disabled={isPaying}
              className={`mt-4 w-full sm:w-auto bg-primary text-white font-bold py-2 px-6 rounded shadow hover:bg-red-800 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${isPaying ? 'opacity-50 cursor-not-allowed' : 'pulse-animation'}`}
            >
              {isPaying ? 'Processing...' : 'Pay Now'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg mb-4 pb-2 border-b">Order Items</h3>
        <div className="divide-y divide-gray-100">
          {order.items.map((item, index) => (
            <div key={index} className="py-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">{item.product.name}</p>
                <p className="text-sm text-gray-500">Size: {item.size} | Color: {item.color}</p>
              </div>
              <div className="font-medium">
                {item.quantity} x ₹{(item.price / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Order;
