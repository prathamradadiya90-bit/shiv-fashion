import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Tag, 
  Settings, 
  LogOut, 
  Mail, 
  Menu, 
  X, 
  ExternalLink,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/api';
import NotificationBell from '../common/NotificationBell';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'SA';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Guard: redirect non-admins immediately
  if (!userInfo || userInfo.role !== 'SUPERADMIN') {
    return <Navigate to="/" replace />;
  }

  const logoutHandler = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout API errors
    }
    dispatch(logout());
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Messages', path: '/admin/messages', icon: Mail },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const currentNav = navItems.find(item => 
    item.path === '/admin' 
      ? location.pathname === '/admin' 
      : location.pathname.startsWith(item.path)
  ) || { name: 'Admin Console' };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-black text-white flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none border-r border-neutral-800 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-24 flex items-center justify-between px-6 border-b border-neutral-800 bg-neutral-950">
          <Link to="/admin" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-full border border-neutral-700 p-0.5 shadow-md flex-shrink-0 group-hover:scale-105 transition-transform bg-white overflow-hidden">
              <img src="/logo.png" alt="chaniyacholi.nook" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-base text-white tracking-wide">chaniyacholi<span className="text-neutral-400">.nook</span></span>
              </div>
              <span className="text-[10px] font-medium text-neutral-400 tracking-widest uppercase">Admin Portal</span>
            </div>
          </Link>
          <button 
            className="md:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Store Quick Link Banner */}
        <div className="px-4 pt-4 pb-2">
          <Link 
            to="/" 
            target="_blank" 
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white transition-all text-xs font-medium group"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-white" />
              <span>Live Storefront</span>
            </div>
            <ExternalLink size={14} className="text-neutral-500 group-hover:text-white transition-colors" />
          </Link>
        </div>
        
        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-neutral-800">
          <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
            Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/admin' 
              ? location.pathname === '/admin' 
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-white text-black font-semibold shadow-md' 
                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={19} className={isActive ? 'text-black' : 'text-neutral-400 group-hover:text-white transition-colors'} />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                )}
              </Link>
            );
          })}
        </div>
        
        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-lg bg-neutral-900">
            <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold text-xs">
              {getInitials(userInfo?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userInfo?.name || 'Administrator'}</p>
              <p className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                Super Admin
              </p>
            </div>
          </div>
          <button 
            onClick={logoutHandler}
            className="flex items-center justify-center w-full px-3 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl transition-all gap-2"
          >
            <LogOut size={15} />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Modern Top Header */}
        <header className="h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 md:px-8 z-20 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>Portal</span>
                <ChevronRight size={12} />
                <span className="text-slate-700 font-semibold">{currentNav.name}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 font-heading">
                {currentNav.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* System Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Database Connected</span>
            </div>

            {/* Notification Bell with Hybrid Sync */}
            <NotificationBell />

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-10 h-10 rounded-full bg-black text-white font-bold flex items-center justify-center shadow-md text-sm">
                {getInitials(userInfo?.name)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-slate-800 leading-tight">{userInfo?.name || 'Super Admin'}</p>
                <p className="text-xs text-slate-400">{userInfo?.email}</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Scrollable Dashboard View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
