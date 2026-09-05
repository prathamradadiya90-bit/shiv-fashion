import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  Plus,
  Tag,
  Mail
} from 'lucide-react';
import api from '../../services/api';

const getStatusBadge = (status) => {
  switch (status) {
    case 'DELIVERED':
      return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
    case 'SHIPPED':
      return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Truck };
    case 'CONFIRMED':
      return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 };
    case 'CANCELLED':
      return { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertCircle };
    default: // PENDING
      return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock };
  }
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-white rounded-2xl border border-slate-200/80 lg:col-span-2 shadow-sm"></div>
          <div className="h-96 bg-white rounded-2xl border border-slate-200/80 shadow-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── KPI Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{Number(stats.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1.5">
              <TrendingUp size={13} />
              <span>Fulfilled sales volume</span>
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-3.5 text-white shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>
        
        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Orders</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalOrders}</h3>
            <p className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-1.5">
              <ShoppingBag size={13} />
              <span>Active store orders</span>
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-3.5 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Customers</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalUsers}</h3>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1.5">
              <Users size={13} />
              <span>Registered accounts</span>
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3.5 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        {/* Total Catalog Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Catalog Items</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalProducts}</h3>
            <p className="text-xs text-purple-600 font-medium flex items-center gap-1 mt-1.5">
              <Package size={13} />
              <span>Ethnic designs</span>
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-3.5 text-white shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <Package size={24} />
          </div>
        </div>
      </div>

      {/* ── Quick Actions Bar ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Quick Actions:</span>
          <Link 
            to="/admin/products/add" 
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus size={14} /> Add Product
          </Link>
          <Link 
            to="/admin/orders" 
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <ShoppingBag size={14} /> Manage Orders
          </Link>
          <Link 
            to="/admin/coupons" 
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <Tag size={14} /> Coupons
          </Link>
          <Link 
            to="/admin/messages" 
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <Mail size={14} /> Inquiries
          </Link>
        </div>
      </div>

      {/* ── Main Content Columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
              <p className="text-xs text-slate-500">Latest orders placed across the store</p>
            </div>
            <Link 
              to="/admin/orders" 
              className="text-xs font-bold text-[#800020] hover:text-[#500014] flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Order ID</th>
                  <th className="px-6 py-3.5 font-semibold">Customer</th>
                  <th className="px-6 py-3.5 font-semibold">Date</th>
                  <th className="px-6 py-3.5 font-semibold">Total Amount</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-400">
                      No orders received yet
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => {
                    const badge = getStatusBadge(order.status);
                    const StatusIcon = badge.icon;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                          #{order.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{order.customer}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {new Date(order.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ₹{Number(order.total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                            <StatusIcon size={12} />
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900">Top Selling Products</h3>
              <p className="text-xs text-slate-500">Ranked by volume of items sold</p>
            </div>
            <Link to="/admin/products" className="text-xs font-bold text-[#800020] hover:underline">
              Inventory
            </Link>
          </div>

          <div className="p-6 flex-1">
            {stats.topProducts?.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No product sales data available yet
              </div>
            ) : (
              <div className="space-y-5">
                {stats.topProducts.map((product, index) => (
                  <div key={product.id || index} className="flex items-center gap-4 group">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/80">
                      <img 
                        src={product.image || 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=100&auto=format&fit=crop&q=80'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={product.name}
                        loading="lazy"
                      />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-slate-900/80 text-white text-[9px] font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-[#800020] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs font-medium text-slate-500">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">
                        {product.sales}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">units sold</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
