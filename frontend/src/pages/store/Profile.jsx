import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { setCredentials, logout } from '../../store/slices/authSlice';

const Profile = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [phone, setPhone] = useState(userInfo?.phone || '');
  const [password, setPassword] = useState('');
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const dispatch = useDispatch();
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

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/profile', { name, email, phone, password });
      dispatch(setCredentials(data));
      toast.success('Profile Updated Successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error updating profile');
    }
  };

  const logoutAllHandler = async () => {
    if (window.confirm('Are you sure you want to log out from all devices? This will invalidate all your current sessions.')) {
      try {
        await api.post('/auth/logout-all');
        dispatch(logout());
        navigate('/login');
        toast.success('Logged out from all devices successfully');
      } catch (error) {
        toast.error('Failed to log out from all devices');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold text-primary mb-8">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Form */}
        <div className="w-full md:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Update Profile</h2>
            <form onSubmit={submitHandler} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
                />
              </div>
              <button type="submit" className="w-full btn-primary mt-4">
                Update Profile
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-red-600 font-bold mb-2">Security</h3>
              <button 
                onClick={logoutAllHandler}
                className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 px-4 rounded transition-colors"
              >
                Log out from ALL devices
              </button>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="w-full md:w-2/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">My Orders</h2>
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
    </div>
  );
};

export default Profile;
