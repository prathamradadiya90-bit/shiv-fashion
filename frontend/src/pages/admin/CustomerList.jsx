import { useState, useEffect, useCallback } from 'react';
import { 
  Download, 
  Search, 
  RefreshCw, 
  Trash2,
  Users
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import AdminHeader from '../../components/admin/AdminHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Pagination from '../../components/admin/Pagination';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filter & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        pageSize: pageSize,
      });

      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const { data } = await api.get(`/users?${params.toString()}`);
      setCustomers(data.users || []);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const toggleStatus = async (id) => {
    setActionLoadingId(id);
    try {
      const { data } = await api.put(`/users/${id}/status`);
      setCustomers(customers.map(c => c.id === id ? { ...c, status: data.status } : c));
      toast.success(`User ${data.status === 'Active' ? 'unblocked' : 'blocked'} successfully`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      setCustomers(customers.filter(c => c.id !== deleteTarget.id));
      setTotalCount(prev => Math.max(0, prev - 1));
      toast.success(`User "${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/export/users', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customers_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Customers CSV exported successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to export customers');
    }
  };

  return (
    <div className="space-y-6">
      {/* Unified Header */}
      <AdminHeader
        title="Customers Directory"
        subtitle="Manage customer profiles, order history, lifetime value, and account access permissions"
        badge={`${totalCount} Registered Users`}
        breadcrumbs={['Users', 'Customers']}
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

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-neutral-200/80 flex flex-col md:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or mobile..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-neutral-400" />
        </form>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-medium text-neutral-700 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Blocked">Blocked Only</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-neutral-700 outline-none cursor-pointer"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* Customers Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/80 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-neutral-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-black" />
            <span className="text-xs font-semibold">Loading customers...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-16 text-center text-neutral-500 space-y-3">
            <Users size={40} className="mx-auto text-neutral-300 stroke-1" />
            <p className="text-sm font-bold text-neutral-800">No customers found</p>
            <p className="text-xs text-neutral-400">Try adjusting your search keywords or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50/80 text-neutral-400 text-[11px] uppercase tracking-wider font-semibold border-b border-neutral-100">
                <tr>
                  <th className="px-6 py-3.5">Customer Profile</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5 text-center">Account Role</th>
                  <th className="px-6 py-3.5 text-center">Orders Count</th>
                  <th className="px-6 py-3.5">Lifetime Spend</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Name & Join Date */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-neutral-900 text-sm">{customer.name}</div>
                      <div className="text-[11px] text-neutral-400">
                        Joined {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4">
                      <div className="text-neutral-900 font-mono">{customer.email}</div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">{customer.phone || '—'}</div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        customer.role === 'SUPERADMIN' 
                          ? 'bg-neutral-900 text-white border-black' 
                          : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                      }`}>
                        {customer.role === 'SUPERADMIN' ? 'Super Admin' : 'Customer'}
                      </span>
                    </td>

                    {/* Orders Count */}
                    <td className="px-6 py-4 text-center font-bold text-neutral-900">
                      {customer.totalOrders}
                    </td>

                    {/* Lifetime Spend */}
                    <td className="px-6 py-4 font-bold text-neutral-950 font-mono whitespace-nowrap text-sm">
                      ₹{customer.totalSpent.toFixed(2)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge type="user" status={customer.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {customer.role !== 'SUPERADMIN' && (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active / Blocked */}
                          <button
                            onClick={() => toggleStatus(customer.id)}
                            disabled={actionLoadingId === customer.id}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors border ${
                              customer.status === 'Active'
                                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title={customer.status === 'Active' ? 'Block customer account' : 'Unblock customer account'}
                          >
                            {customer.status === 'Active' ? 'Block' : 'Unblock'}
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setDeleteTarget({ id: customer.id, name: customer.name })}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete user account"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
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
            itemName="customers"
          />
        )}
      </div>

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteUser}
        isLoading={deleting}
        title="Delete Customer Account?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? Their profile and login access will be removed.`}
        confirmText="Yes, Delete Customer"
        variant="danger"
      />
    </div>
  );
};

export default CustomerList;
