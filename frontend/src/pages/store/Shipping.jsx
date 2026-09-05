import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress } from '../../store/slices/cartSlice';
import CheckoutSteps from './CheckoutSteps';
import api from '../../services/api';
import { MapPin, CheckCircle2 } from 'lucide-react';

const Shipping = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [street, setStreet] = useState(shippingAddress.street || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [state, setState] = useState(shippingAddress.state || '');
  const [zipCode, setZipCode] = useState(shippingAddress.zipCode || '');
  const [country, setCountry] = useState(shippingAddress.country || 'India');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      api.get('/addresses')
        .then(({ data }) => {
          setSavedAddresses(data);
          if (data.length > 0 && !street) {
            // Auto-fill with default address if no street is entered
            const defaultAddr = data.find((a) => a.isDefault) || data[0];
            setSelectedAddressId(defaultAddr.id);
            setStreet(defaultAddr.street);
            setCity(defaultAddr.city);
            setState(defaultAddr.state);
            setZipCode(defaultAddr.zipCode);
            setCountry(defaultAddr.country || 'India');
          }
        })
        .catch((err) => console.error('Failed to load saved addresses:', err));
    }
  }, [userInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
    setCountry(addr.country || 'India');
  };

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ street, city, state, zipCode, country }));
    navigate('/placeorder');
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <CheckoutSteps step1 step2 />

      <div className="w-full max-w-2xl mt-8">
        {/* Saved Addresses quick picker */}
        {savedAddresses.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary" /> Choose a Saved Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => handleSelectSavedAddress(addr)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAddressId === addr.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-gray-900">{addr.city}, {addr.state}</span>
                    {selectedAddressId === addr.id && (
                      <CheckCircle2 size={16} className="text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {addr.street}, {addr.zipCode}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-heading font-bold text-primary mb-6">
            {savedAddresses.length > 0 ? 'Or Enter / Edit Address' : 'Shipping Address'}
          </h1>
          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input 
                type="text" 
                required
                value={street}
                onChange={(e) => {
                  setSelectedAddressId(null);
                  setStreet(e.target.value);
                }}
                placeholder="House / Flat No., Street, Area"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2.5 border text-sm" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input 
                  type="text" 
                  required
                  value={city}
                  onChange={(e) => {
                    setSelectedAddressId(null);
                    setCity(e.target.value);
                  }}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2.5 border text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input 
                  type="text" 
                  required
                  value={state}
                  onChange={(e) => {
                    setSelectedAddressId(null);
                    setState(e.target.value);
                  }}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2.5 border text-sm" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip / Postal Code</label>
                <input 
                  type="text" 
                  required
                  value={zipCode}
                  onChange={(e) => {
                    setSelectedAddressId(null);
                    setZipCode(e.target.value);
                  }}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2.5 border text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input 
                  type="text" 
                  required
                  value={country}
                  onChange={(e) => {
                    setSelectedAddressId(null);
                    setCountry(e.target.value);
                  }}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2.5 border text-sm" 
                />
              </div>
            </div>
            <button type="submit" className="w-full btn-primary mt-6 text-base py-3">
              Continue to Order Summary
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
