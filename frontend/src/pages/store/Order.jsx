import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle, RotateCcw, XCircle, AlertTriangle, X, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { loadRazorpayScript } from '../../utils/razorpay';

const Order = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  // Cancellation state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Return request state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Defective / Damaged Item');
  const [returnComments, setReturnComments] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

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

  useEffect(() => {
    fetchOrder();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const payNowHandler = async () => {
    try {
      setIsPaying(true);
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsPaying(false);
        return;
      }

      const { data } = await api.post(`/orders/${id}/retry-pay`);
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
        name: 'Shiv Fashion',
        description: 'Order Payment',
        order_id: data.razorpayOrder.id,
        handler: async function (response) {
          try {
            await api.post(`/orders/${id}/pay`, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            
            toast.success('Payment Successful!');
            fetchOrder();
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

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const { data } = await api.post(`/orders/${id}/cancel`);
      toast.success(data.message || 'Order cancelled successfully');
      setShowCancelModal(false);
      fetchOrder();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnReason) {
      return toast.error('Please select a reason for the return');
    }

    setSubmittingReturn(true);
    try {
      const { data } = await api.post(`/orders/${id}/return`, {
        reason: returnReason,
        comments: returnComments,
      });
      toast.success(data.message || 'Return request submitted successfully');
      setShowReturnModal(false);
      setReturnComments('');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const downloadInvoiceHandler = async () => {
    setDownloadingInvoice(true);
    try {
      const response = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${order.id.slice(-8).toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to download invoice');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading order...</div>;
  if (!order) return <div className="text-center py-20 text-red-500 font-bold">Order Not Found</div>;

  const isPaid = order.paymentStatus === 'PAID';
  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status) && !isCancelled;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRMED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Banner */}
      {isCancelled ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl flex items-center mb-8">
          <XCircle size={32} className="mr-4 text-red-500 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold">Order Cancelled</h2>
            <p>Your order <strong>#{order.id.slice(-8)}</strong> is cancelled. {order.paymentStatus === 'REFUNDED' && 'Refund has been initiated.'}</p>
          </div>
        </div>
      ) : isPaid ? (
        <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl flex items-center mb-8">
          <CheckCircle size={32} className="mr-4 text-green-500 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold">Order Confirmed</h2>
            <p>Thank you for your purchase! Your order ID is <strong>#{order.id}</strong></p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-xl flex items-center mb-8">
          <AlertTriangle size={32} className="mr-4 text-yellow-500 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold">Payment Pending</h2>
            <p>Your order ID is <strong>#{order.id}</strong>. Please complete payment to process your shipment.</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Shipping Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-4 pb-2 border-b">Shipping Summary</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Status:</strong>{' '}
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${getStatusBadge(order.status)}`}>
                  {order.status}
                </span>
              </p>
              {order.trackingNumber && (
                <p className="text-primary">
                  <strong>Tracking No:</strong> {order.trackingNumber}
                </p>
              )}
              <p className="text-gray-700">
                <strong>Address:</strong><br />
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
            </div>
          </div>

          {/* Action buttons (Cancel / Return) */}
          <div className="pt-4 mt-4 border-t border-gray-100 flex flex-wrap gap-3">
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="bg-white text-red-600 border border-red-300 hover:bg-red-50 text-sm font-semibold py-2 px-4 rounded-md transition-colors flex items-center gap-2"
              >
                <XCircle size={16} /> Cancel Order
              </button>
            )}

            {isDelivered && (
              <button
                onClick={() => setShowReturnModal(true)}
                className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-sm font-semibold py-2 px-4 rounded-md transition-colors flex items-center gap-2"
              >
                <RotateCcw size={16} /> Request Return / Exchange
              </button>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-4 pb-2 border-b">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Status:</strong>{' '}
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                  order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                  order.paymentStatus === 'REFUNDED' ? 'bg-purple-100 text-purple-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </p>
              <p>
                <strong>Method:</strong> {order.isCOD ? 'Cash on Delivery (Advance Paid)' : 'Online Payment'}
              </p>
              <p>
                <strong>Total Amount:</strong>{' '}
                <span className="font-bold text-primary text-base">₹{(order.totalAmount / 100).toFixed(2)}</span>
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-3">
            <button
              onClick={downloadInvoiceHandler}
              disabled={downloadingInvoice}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 font-semibold py-2 px-4 rounded-md text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download size={16} /> {downloadingInvoice ? 'Generating Invoice...' : 'Download Invoice (PDF)'}
            </button>

            {order.paymentStatus === 'UNPAID' && !isCancelled && (
              <button
                type="button"
                onClick={payNowHandler}
                disabled={isPaying}
                className={`w-full bg-primary text-white font-bold py-2.5 px-6 rounded-md shadow hover:bg-red-800 transition-all duration-300 ${
                  isPaying ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isPaying ? 'Processing...' : 'Pay Now'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg mb-4 pb-2 border-b">Order Items</h3>
        <div className="divide-y divide-gray-100">
          {order.items.map((item, index) => (
            <div key={index} className="py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {item.product?.images?.[0]?.url && (
                  <img
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-md border border-gray-100"
                  />
                )}
                <div>
                  <p className="font-bold text-gray-800">{item.product?.name || 'Product'}</p>
                  <p className="text-sm text-gray-500">Size: {item.size} | Color: {item.color}</p>
                </div>
              </div>
              <div className="font-medium text-gray-900">
                {item.quantity} × ₹{(item.price / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle size={20} /> Cancel Order #{order.id.slice(-6)}
              </h3>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Are you sure you want to cancel this order? Once cancelled, reserved stock will be released back.
              {order.paymentStatus === 'PAID' && ' A full refund will be automatically initiated to your original payment method.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <RotateCcw size={20} className="text-primary" /> Request Return / Replacement
              </h3>
              <button onClick={() => setShowReturnModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Return *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-primary focus:border-primary text-sm"
                >
                  <option value="Defective / Damaged Item">Defective / Damaged Item</option>
                  <option value="Incorrect Item or Size Delivered">Incorrect Item or Size Delivered</option>
                  <option value="Quality not as expected">Quality not as expected</option>
                  <option value="Fit / Size issue">Fit / Size issue</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Comments (Optional)</label>
                <textarea
                  rows={3}
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  placeholder="Please describe the issue in detail..."
                  className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-primary focus:border-primary text-sm"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 leading-relaxed">
                * Returns are subject to our 7-day return policy. Items must be in original unworn condition with all tags attached.
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="btn-primary py-2 px-6 text-sm disabled:opacity-50"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
