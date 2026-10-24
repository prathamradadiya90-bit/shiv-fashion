import { useState, useEffect, useCallback } from 'react';
import { 
  Eye, 
  Download, 
  RefreshCcw, 
  Search, 
  RefreshCw, 
  Truck, 
  FileText,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import AdminHeader from '../../components/admin/AdminHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Pagination from '../../components/admin/Pagination';

const STATUS_TABS = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [shippingTarget, setShippingTarget] = useState(null); // { orderId, currentTracking }
  const [refundTarget, setRefundTarget] = useState(null); // { orderId }
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        pageSize: pageSize,
      });

      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (search.trim()) params.append('search', search.trim());

      const { data } = await api.get(`/orders?${params.toString()}`);
      setOrders(data.orders ?? []);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, selectedStatus, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'SHIPPED') {
      const currentOrder = orders.find(o => o.id === orderId);
      setShippingTarget({ orderId, currentTracking: currentOrder?.trackingNumber || '' });
      return;
    }

    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update order status');
    }
  };

  const confirmShipping = async (trackingNumber) => {
    if (!shippingTarget) return;
    setActionLoading(true);
    try {
      await api.put(`/orders/${shippingTarget.orderId}/status`, {
        status: 'SHIPPED',
        trackingNumber: trackingNumber?.trim() || null,
      });
      setOrders(orders.map(order =>
        order.id === shippingTarget.orderId
          ? { ...order, status: 'SHIPPED', trackingNumber: trackingNumber?.trim() || order.trackingNumber }
          : order
      ));
      toast.success('Order marked as SHIPPED with tracking number');
      setShippingTarget(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update shipment');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmRefund = async () => {
    if (!refundTarget) return;
    setActionLoading(true);
    try {
      await api.post(`/orders/${refundTarget.orderId}/refund`);
      setOrders(orders.map(order =>
        order.id === refundTarget.orderId ? { ...order, paymentStatus: 'REFUNDED', status: 'CANCELLED' } : order
      ));
      toast.success('Refund processed successfully');
      setRefundTarget(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to initiate refund');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `chaniyacholi_invoice_${orderId.slice(-8).toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Tax invoice downloaded');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to download invoice');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/export/orders', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Orders CSV exported successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to export orders');
    }
  };

  return (
    <div className="space-y-6">
      {/* Unified Header */}
      <AdminHeader
        title="Orders & Shipments"
        subtitle="Live fulfillment monitoring, status progression, dispatch tracking, and PDF tax invoices"
        badge={`${totalCount} Total Orders`}
        breadcrumbs={['Sales', 'Orders']}
        action={
          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        }
      />

      {/* Status Filter Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide border-b border-neutral-200">
        {STATUS_TABS.map((tab) => {
          const isSelected = selectedStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setSelectedStatus(tab.value);
                setPage(1);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                isSelected
                  ? 'border-black text-black bg-neutral-100 font-extrabold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Options Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-neutral-200/80 flex flex-col md:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Order ID, customer, email, or tracking..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-neutral-400" />
        </form>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-medium text-neutral-700 outline-none cursor-pointer"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/80 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-neutral-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-black" />
            <span className="text-xs font-semibold">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-neutral-500 space-y-3">
            <ShoppingBag size={40} className="mx-auto text-neutral-300 stroke-1" />
            <p className="text-sm font-bold text-neutral-800">No orders found in this view</p>
            <p className="text-xs text-neutral-400">Try changing status filter tabs or search parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50/80 text-neutral-400 text-[11px] uppercase tracking-wider font-semibold border-b border-neutral-100">
                <tr>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Placed On</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5">Fulfillment Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Order ID & Tracking */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-neutral-900 text-xs">
                        #{order.id.slice(-8).toUpperCase()}
                      </div>
                      {order.trackingNumber ? (
                        <div className="text-[11px] text-neutral-600 flex items-center gap-1 font-mono mt-0.5" title={`Shipment: ${order.trackingNumber}`}>
                          <Truck size={12} className="text-neutral-500" />
                          <span className="truncate max-w-[130px]">{order.trackingNumber}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-neutral-400 italic">No tracking yet</span>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-neutral-900">{order.user?.name || 'Customer'}</div>
                      <div className="text-[11px] text-neutral-400 font-mono truncate max-w-[180px]">
                        {order.user?.email || '—'}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-neutral-600 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Total Amount */}
                    <td className="px-6 py-4 font-bold text-neutral-950 font-mono whitespace-nowrap text-sm">
                      ₹{(order.totalAmount / 100).toFixed(2)}
                    </td>

                    {/* Payment Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                        order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        order.paymentStatus === 'REFUNDED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs font-bold rounded-xl px-2.5 py-1.5 border border-neutral-200 bg-white text-neutral-900 shadow-2xs focus:ring-2 focus:ring-black outline-none cursor-pointer"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Download PDF Invoice */}
                        <button
                          onClick={() => handleDownloadInvoice(order.id)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
                          title="Download PDF Tax Invoice"
                        >
                          <FileText size={15} />
                        </button>

                        {/* Refund Action */}
                        {order.paymentStatus === 'PAID' && order.status !== 'CANCELLED' && (
                          <button 
                            onClick={() => setRefundTarget({ orderId: order.id })}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Initiate Customer Refund"
                          >
                            <RefreshCcw size={15} />
                          </button>
                        )}

                        {/* View Order Summary */}
                        <Link
                          to={`/order/${order.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
                          title="View order receipt & tracking timeline"
                        >
                          <Eye size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DRY Pagination Component */}
        {!loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            itemName="orders"
          />
        )}
      </div>

      {/* Shipment Prompt Modal (Replaces window.prompt) */}
      <ConfirmModal
        isOpen={Boolean(shippingTarget)}
        onClose={() => setShippingTarget(null)}
        onConfirm={confirmShipping}
        isLoading={actionLoading}
        title="Mark Order as Shipped"
        message="Enter the courier consignment or tracking number so the customer can track their delivery live."
        promptLabel="Courier Consignment / AWB Number"
        promptPlaceholder="e.g. BLUEDART-8492019, DTDC-3910294"
        promptInitialValue={shippingTarget?.currentTracking || ''}
        confirmText="Confirm Shipment"
        variant="prompt"
      />

      {/* Refund Confirmation Modal (Replaces window.confirm) */}
      <ConfirmModal
        isOpen={Boolean(refundTarget)}
        onClose={() => setRefundTarget(null)}
        onConfirm={confirmRefund}
        isLoading={actionLoading}
        title="Process Full Order Refund?"
        message="This will initiate an online refund back to the customer's original payment source and mark the order as CANCELLED."
        confirmText="Yes, Process Refund"
        variant="danger"
      />
    </div>
  );
};

export default OrderList;
