import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { setCredentials } from '../../store/slices/authSlice';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { userInfo } = useSelector((state) => state.auth);

  // Where to go after login — default to home or admin
  const redirectPath = searchParams.get('redirect') || null;

  useEffect(() => {
    if (userInfo) {
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (userInfo.role === 'SUPERADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [navigate, userInfo, redirectPath]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      dispatch(setCredentials(res.data));
      toast.success('Logged in successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-secondary/20 w-full max-w-md">
        <div className="w-16 h-16 rounded-full border-2 border-secondary/60 shadow-[0_0_15px_rgba(197,155,39,0.3)] overflow-hidden mx-auto mb-4 bg-white">
          <img src="/logo.png" alt="chaniyacholi.nook" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-primary mb-1 text-center">Login to chaniyacholi<span className="text-secondary">.nook</span></h1>
        <p className="text-[11px] text-center text-secondary-dark font-medium tracking-widest uppercase mb-6">Tradition • Style • You</p>
        
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border pr-10" 
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-primary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot Password?</Link>
            </div>
          </div>
          
          <button type="submit" className="w-full btn-primary mt-6">
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          New Customer? <Link to="/register" className="text-primary hover:underline font-bold">Register Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
