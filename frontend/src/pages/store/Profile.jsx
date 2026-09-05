import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { setCredentials, logout } from '../../store/slices/authSlice';
import { Eye, EyeOff, MapPin, Plus, Trash2, Edit2, CheckCircle2, Shield, User, X } from 'lucide-react';

const Profile = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'addresses'

  // Profile Form States
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [phone, setPhone] = useState(userInfo?.phone || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address States
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      fetchAddresses();
    }
  }, [userInfo, navigate]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const { data } = await api.get('/addresses');
      setAddresses(data);
    } catch (error) {
      console.error('Failed to load addresses:', error?.response?.data?.message || error.message);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const submitProfileHandler = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name,
        email,
        phone,
        password: password.trim() ? password : undefined,
      });
      dispatch(setCredentials(data));
      setPassword('');
      toast.success('Profile Updated Successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error updating profile');
    } finally {
      setUpdatingProfile(false);
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
        toast.error(error?.response?.data?.message || 'Failed to log out from all devices');
      }
    }
  };

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      isDefault: addresses.length === 0,
    });
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country || 'India',
      isDefault: addr.isDefault,
    });
    setShowAddressModal(true);
  };

  const submitAddressHandler = async (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      return toast.error('Please fill in all required address fields');
    }

    setSavingAddress(true);
    try {
      if (editingAddressId) {
        await api.put(`/addresses/${editingAddressId}`, addressForm);
        toast.success('Address updated successfully');
      } else {
        await api.post('/addresses', addressForm);
        toast.success('Address added successfully');
      }
      setShowAddressModal(false);
      fetchAddresses();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await api.put(`/addresses/${id}/default`);
      toast.success('Default address updated');
      fetchAddresses();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to set default address');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-heading font-bold text-primary mb-8">My Account</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 space-x-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-4 px-2 font-semibold text-lg flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <User size={20} /> Profile & Security
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-4 px-2 font-semibold text-lg flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'addresses'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapPin size={20} /> Saved Addresses
          {addresses.length > 0 && (
            <span className="ml-1 bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {addresses.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Profile & Security */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Profile Information</h2>
          <form onSubmit={submitProfileHandler} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm p-3 border focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm p-3 border focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full border-gray-300 rounded-md shadow-sm p-3 border focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full btn-primary mt-4 py-3 disabled:opacity-50"
            >
              {updatingProfile ? 'Saving Changes...' : 'Update Profile'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <h3 className="text-gray-900 font-bold mb-2 flex items-center gap-2">
              <Shield size={18} className="text-red-600" /> Account Security
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Lost a device or suspect unauthorized activity? You can immediately terminate all active login sessions.
            </p>
            <button
              onClick={logoutAllHandler}
              className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 px-4 rounded-md font-medium transition-colors"
            >
              Log out from ALL devices
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Address Book */}
      {activeTab === 'addresses' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Saved Addresses</h2>
              <p className="text-sm text-gray-500">Manage your shipping and delivery addresses for quick checkout</p>
            </div>
            <button
              onClick={openAddAddressModal}
              className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
            >
              <Plus size={18} /> Add New Address
            </button>
          </div>

          {loadingAddresses ? (
            <div className="text-center py-12 text-gray-500">Loading saved addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="bg-white p-12 rounded-xl text-center border border-gray-100 shadow-sm">
              <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">No Saved Addresses</h3>
              <p className="text-gray-500 text-sm mb-6">Add your delivery addresses to enjoy seamless and faster checkout.</p>
              <button onClick={openAddAddressModal} className="btn-primary py-2 px-6">
                Add Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white p-6 rounded-xl border transition-all ${
                    addr.isDefault
                      ? 'border-primary shadow-md ring-1 ring-primary/20'
                      : 'border-gray-200 shadow-sm hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={20} className={addr.isDefault ? 'text-primary' : 'text-gray-400'} />
                      <span className="font-bold text-gray-900">{addr.city}, {addr.state}</span>
                    </div>
                    {addr.isDefault && (
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Default
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {addr.street}<br />
                    {addr.city}, {addr.state} - {addr.zipCode}<br />
                    {addr.country || 'India'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                    {!addr.isDefault ? (
                      <button
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-gray-600 hover:text-primary font-medium text-xs underline"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-xs text-green-600 font-medium">Primary delivery address</span>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditAddressModal(addr)}
                        className="text-gray-500 hover:text-primary p-1 rounded hover:bg-gray-50 transition-colors"
                        title="Edit Address"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete Address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Address Form Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitAddressHandler} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="House / Flat No., Building, Street, Area"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-primary focus:border-primary text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surat"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gujarat"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip / Postal Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 395006"
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 font-medium">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  Make this my default delivery address
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="btn-primary py-2 px-6 text-sm disabled:opacity-50"
                >
                  {savingAddress ? 'Saving...' : editingAddressId ? 'Save Changes' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
