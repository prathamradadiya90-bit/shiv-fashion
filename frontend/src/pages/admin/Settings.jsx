import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Save, User, Lock, ShieldCheck, Eye, EyeOff, KeyRound, Server } from 'lucide-react';
import api from '../../services/api';
import { setCredentials } from '../../store/slices/authSlice';

const Settings = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password && password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (password && password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name: name.trim(),
        email: email.trim(),
        password: password || undefined,
      });
      dispatch(setCredentials({ ...data }));
      toast.success('Admin profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 font-heading">Admin Settings</h2>
        <p className="text-xs text-slate-500">Manage administrator account security, credentials, and store preferences</p>
      </div>

      <form onSubmit={submitHandler} className="space-y-6">
        {/* Card 1: Profile Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User size={18} className="text-[#800020]" />
            <span>Administrator Profile</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#800020] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#800020] outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Card 2: Password & Security */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock size={18} className="text-blue-600" />
              <span>Password & Authentication</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                New Password (Optional)
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="Leave blank to keep unchanged"
                />
                <KeyRound size={16} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="Repeat new password"
                />
                <KeyRound size={16} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/70 flex items-start gap-3">
            <ShieldCheck size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 space-y-1">
              <p className="font-bold">Security & Token Invalidation Notice</p>
              <p className="text-blue-700">
                Updating your password increments your account's cryptographic token version, immediately revoking all other active browser sessions across devices.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: System Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Server size={18} className="text-purple-600" />
            <span>Deployment & Security Specs</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 font-semibold block mb-1">Access Role</span>
              <span className="font-bold text-slate-900 font-mono">SUPERADMIN</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 font-semibold block mb-1">Database Engine</span>
              <span className="font-bold text-slate-900 font-mono">PostgreSQL / Prisma</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 font-semibold block mb-1">Gateway Mode</span>
              <span className="font-bold text-emerald-600 font-mono">Razorpay Live / Partial COD</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#5a0016] text-white text-sm font-bold hover:from-[#6b001b] hover:to-[#450011] shadow-lg shadow-[#800020]/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} /> 
            {loading ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
