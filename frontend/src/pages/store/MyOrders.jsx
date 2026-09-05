import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Package, XCircle, RotateCcw, Eye, AlertTriangle, X, Download } from 'lucide-react';

const MyOrders = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const navigate = useNavigate();

  // Cancel order modal
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancellingLoading, setCancellingLoading] = useState(false);

  // Return request modal
  const [returningOrder, setReturningOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Defective / Damaged Item');
  const [returnComments, setReturnComments] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  const fetchMyOrders = async () => {
    if (!userInfo?.token) {
      setLoadingOrders(false);
      return;
    }
    try {
      const { data } = await api.get('/orders/myorders');
      setOrders(data.orders ?? []);
    } catch (error) {
      console.error('Failed to load orders:', error?.response?.data?.message || error.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    setCancellingLoading(true);
    try {
      const { data } = await api.post(`/orders/${cancellingOrder.id}/cancel`);
      toast.success(data.message || 'Order cancelled successfully');
      setCancellingOrder(null);
      fetchMyOrders();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingLoading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returningOrder) return;
    setSubmittingReturn(true);
    try {
      const { data } = await api.post(`/orders/${returningOrder.id}/return`, {
        reason: returnReason,
        comments: returnComments,
      });
      toast.success(data.message || 'Return request submitted successfully');
      setReturningOrder(null);
      setReturnComments('');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${orderId.slice(-8).toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to download invoice');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'CONFIRMED':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-heading font-bold text-primary mb-8 flex items-center gap-3">
        <Package size={28} /> My Orders
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {loadingOrders ? (
          <div className="text-center py-12 text-gray-500">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium mb-4">You have not placed any orders yet.</p>
            <Link to="/shop" className="btn-primary py-2.5 px-6">Start Shopping</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="px-4 py-3.5 font-semibold">Order ID</th>
                  <th className="px-4 py-3.5 font-semibold">Date</th>
                  <th className="px-4 py-3.5 font-semibold">Items</th>
                  <th className="px-4 py-3.5 font-semibold">Total Amount</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {orders.map((order) => {
                  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
                  const isDelivered = order.status === 'DELIVERED';

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 font-mono font-medium text-gray-900">
                        #{order.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-900">
                        ₹{(order.totalAmount / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadInvoice(order.id)}
                            className="text-gray-600 hover:text-primary hover:bg-gray-100 p-1 rounded transition-colors"
                            title="Download Invoice (PDF)"
                          >
                            <Download size={14} />
                          </button>

                          <Link
                            to={`/order/${order.id}`}
                            className="text-primary hover:bg-primary/5 px-2.5 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 border border-transparent hover:border-primary/20 transition-all"
                            title="View Order Details"
                          >
                            <Eye size={14} /> View
                          </Link>

                          {canCancel && (
                            <button
                              onClick={() => setCancellingOrder(order)}
                              className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium border border-red-200 transition-colors flex items-center gap-1"
                              title="Cancel Order"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          )}

                          {isDelivered && (
                            <button
                              onClick={() => setReturningOrder(order)}
                              className="text-gray-700 hover:bg-gray-100 px-2 py-1 rounded text-xs font-medium border border-gray-300 transition-colors flex items-center gap-1"
                              title="Request Return"
                            >
                              <RotateCcw size={14} /> Return
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle size={20} /> Cancel Order #{cancellingOrder.id.slice(-6).toUpperCase()}
              </h3>
              <button onClick={() => setCancellingOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Are you sure you want to cancel this order?
              {cancellingOrder.paymentStatus === 'PAID' && ' A full refund will be automatically processed.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancellingLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
              >
                {cancellingLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {returningOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <RotateCcw size={20} className="text-primary" /> Return Order #{returningOrder.id.slice(-6).toUpperCase()}
              </h3>
              <button onClick={() => setReturningOrder(null)} className="text-gray-400 hover:text-gray-600">
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
                  placeholder="Please describe the reason for return..."
                  className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-primary focus:border-primary text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReturningOrder(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="btn-primary py-2 px-6 text-sm disabled:opacity-50"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
