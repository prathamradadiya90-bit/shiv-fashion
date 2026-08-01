import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { setCredentials, logout } from '../../store/slices/authSlice';
import { Eye, EyeOff } from 'lucide-react';

const Profile = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [phone, setPhone] = useState(userInfo?.phone || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

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
      
      <div className="max-w-xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6">Update Profile</h2>
          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm p-3 border focus:ring-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm p-3 border focus:ring-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm p-3 border focus:ring-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm p-3 border focus:ring-primary focus:border-primary pr-10" 
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full btn-primary mt-6 py-3">
              Update Profile
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-red-600 font-bold mb-3">Security</h3>
            <button 
              onClick={logoutAllHandler}
              className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 px-4 rounded transition-colors"
            >
              Log out from ALL devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
