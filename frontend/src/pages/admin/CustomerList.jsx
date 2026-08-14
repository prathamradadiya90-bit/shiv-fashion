import React, { useState, useEffect, useCallback } from 'react';
import { Ban, CheckCircle, Download, Search, RefreshCw, ChevronLeft, ChevronRight, User, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

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

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"? This action cannot be undone.`)) {
      return;
    }
    setActionLoadingId(id);
    try {
      await api.delete(`/users/${id}`);
      setCustomers(customers.filter(c => c.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoadingId(null);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Customers Management</h2>
          <p className="text-sm text-gray-500">View registered users, order statistics, and account access</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2.5 rounded-lg hover:bg-black transition-all text-sm font-medium shadow-sm"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary py-2 px-3 bg-white"
          >
            <option value="all">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Blocked">Blocked Only</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary py-2 px-3 bg-white"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Customers Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-primary" />
            <span>Loading customers...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <User size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="text-base font-medium text-gray-700 mb-1">No customers found</p>
            <p className="text-xs text-gray-400">Try adjusting your search keywords or status filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold text-center">Role</th>
                  <th className="px-6 py-4 font-semibold text-center">Orders</th>
                  <th className="px-6 py-4 font-semibold">Total Spent</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-400">
                        Joined {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-mono text-xs">{customer.email}</div>
                      <div className="text-xs text-gray-500">{customer.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                        customer.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {customer.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-900">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                      ₹{customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {customer.role !== 'SUPERADMIN' && (
                        <div className="flex items-center justify-end gap-2">
                          {customer.status === 'Active' ? (
                            <button 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors disabled:opacity-50" 
                              title="Block User"
                              disabled={actionLoadingId === customer.id}
                              onClick={() => toggleStatus(customer.id)}
                            >
                              <Ban size={17} />
                            </button>
                          ) : (
                            <button 
                              className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1.5 rounded transition-colors disabled:opacity-50" 
                              title="Unblock User"
                              disabled={actionLoadingId === customer.id}
                              onClick={() => toggleStatus(customer.id)}
                            >
                              <CheckCircle size={17} />
                            </button>
                          )}
                          <button
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors disabled:opacity-50"
                            title="Delete User"
                            disabled={actionLoadingId === customer.id}
                            onClick={() => handleDeleteUser(customer.id, customer.name)}
                          >
                            <Trash2 size={17} />
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

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <div>
              Showing <span className="font-semibold">{Math.min((page - 1) * pageSize + 1, totalCount)}</span> to{' '}
              <span className="font-semibold">{Math.min(page * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> customers
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1 px-2 font-medium">
                Page {page} of {totalPages}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
