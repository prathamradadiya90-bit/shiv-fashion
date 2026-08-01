import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const MyOrders = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      fetchMyOrders();
    }
  }, [userInfo, navigate]);

  const fetchMyOrders = async () => {
    try {
      const { data } = await api.get('/orders/myorders');
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold text-primary mb-8">My Orders</h1>
      
      <div className="max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          {loadingOrders ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You have no orders yet.</p>
              <Link to="/shop" className="btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-sm">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">{order.id.slice(-6)}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-bold">₹{order.totalAmount}</td>
                      <td className="px-4 py-3">
                        {order.paymentStatus === 'PAID' ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-red-600 font-medium">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/order/${order.id}`} className="text-primary hover:underline text-sm font-medium">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
