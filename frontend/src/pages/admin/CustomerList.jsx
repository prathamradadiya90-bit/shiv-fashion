import React, { useState, useEffect } from 'react';
import { Ban, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get('/users');
        setCustomers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const toggleStatus = async (id) => {
    try {
      const { data } = await api.put(`/users/${id}/status`);
      setCustomers(customers.map(c => c.id === id ? { ...c, status: data.status } : c));
      toast.success(`User ${data.status === 'Active' ? 'unblocked' : 'blocked'} successfully`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customers Management</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium text-center">Orders</th>
                  <th className="px-6 py-4 font-medium">Spent</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.email}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
                    <td className="px-6 py-4 text-center font-medium">{customer.totalOrders}</td>
                    <td className="px-6 py-4 font-medium text-primary">₹{customer.totalSpent}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {customer.status === 'Active' ? (
                        <button 
                          className="text-red-500 hover:text-red-700 transition-colors" 
                          title="Block User"
                          onClick={() => toggleStatus(customer.id)}
                        >
                          <Ban size={18} />
                        </button>
                      ) : (
                        <button 
                          className="text-green-500 hover:text-green-700 transition-colors" 
                          title="Unblock User"
                          onClick={() => toggleStatus(customer.id)}
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
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

export default CustomerList;
