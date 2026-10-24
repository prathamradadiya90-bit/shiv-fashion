import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight, 
  TrendingUp, 
  Plus,
  Tag,
  Mail,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import AdminHeader from '../../components/admin/AdminHeader';
import StatusBadge from '../../components/admin/StatusBadge';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-white rounded-2xl border border-neutral-200/80 lg:col-span-2 shadow-xs"></div>
          <div className="h-96 bg-white rounded-2xl border border-neutral-200/80 shadow-xs"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Unified Dashboard Header ── */}
      <AdminHeader
        title="Admin Overview"
        subtitle="Real-time performance metrics, recent customer transactions, and bestselling inventory"
        badge="Live Metrics"
        breadcrumbs={['Portal', 'Dashboard']}
        action={
          <div className="flex items-center gap-2">
            <Link 
              to="/admin/products/add" 
              className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus size={15} /> Add Lehenga
            </Link>
            <Link 
              to="/" 
              target="_blank" 
              className="px-4 py-2.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <ExternalLink size={14} /> Storefront
            </Link>
          </div>
        }
      />

      {/* ── 4 KPI Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-neutral-200/80 flex items-center justify-between hover:border-black transition-colors">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Total Sales Revenue</p>
            <h3 className="text-2xl font-bold text-neutral-950 tracking-tight font-mono">
              ₹{Number(stats.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp size={12} />
              <span>Fulfilled order volume</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black border border-neutral-200 flex items-center justify-center flex-shrink-0">
            <DollarSign size={22} />
          </div>
        </div>
        
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-neutral-200/80 flex items-center justify-between hover:border-black transition-colors">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Customer Orders</p>
            <h3 className="text-2xl font-bold text-neutral-950 tracking-tight font-mono">{stats.totalOrders}</h3>
            <p className="text-[11px] text-neutral-600 font-medium flex items-center gap-1 mt-1">
              <ShoppingBag size={12} />
              <span>Lifetime purchases</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black border border-neutral-200 flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-neutral-200/80 flex items-center justify-between hover:border-black transition-colors">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Total Customers</p>
            <h3 className="text-2xl font-bold text-neutral-950 tracking-tight font-mono">{stats.totalUsers}</h3>
            <p className="text-[11px] text-neutral-600 font-medium flex items-center gap-1 mt-1">
              <Users size={12} />
              <span>Registered accounts</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black border border-neutral-200 flex items-center justify-center flex-shrink-0">
            <Users size={22} />
          </div>
        </div>

        {/* Total Catalog Products */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-neutral-200/80 flex items-center justify-between hover:border-black transition-colors">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Catalog Products</p>
            <h3 className="text-2xl font-bold text-neutral-950 tracking-tight font-mono">{stats.totalProducts}</h3>
            <p className="text-[11px] text-neutral-600 font-medium flex items-center gap-1 mt-1">
              <Package size={12} />
              <span>Ethnic designs</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black border border-neutral-200 flex items-center justify-center flex-shrink-0">
            <Package size={22} />
          </div>
        </div>
      </div>

      {/* ── Quick Maintenance Toolbar ── */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-2">Quick Navigation:</span>
          <Link 
            to="/admin/products" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors"
          >
            <Package size={13} /> Product Inventory
          </Link>
          <Link 
            to="/admin/orders" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors"
          >
            <ShoppingBag size={13} /> Process Orders
          </Link>
          <Link 
            to="/admin/coupons" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors"
          >
            <Tag size={13} /> Coupons & Promos
          </Link>
          <Link 
            to="/admin/messages" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors"
          >
            <Mail size={13} /> Contact Inquiries
          </Link>
        </div>
      </div>

      {/* ── 2 Main Grid Columns (Recent Orders + Top Products) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/80 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 font-heading">Recent Customer Orders</h3>
              <p className="text-xs text-neutral-400">Latest orders placed across the store</p>
            </div>
            <Link 
              to="/admin/orders" 
              className="text-xs font-bold text-black hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-neutral-50/80 text-neutral-400 text-[11px] uppercase tracking-wider font-semibold border-b border-neutral-100">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-neutral-400">
                      No customer orders recorded yet
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-neutral-900">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-neutral-800">{order.customer}</td>
                      <td className="px-6 py-3.5 text-neutral-500">
                        {new Date(order.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-neutral-950 font-mono">
                        ₹{Number(order.total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge type="order" status={order.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/80 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 font-heading">Top Selling Designs</h3>
              <p className="text-xs text-neutral-400">Ranked by volume of pieces sold</p>
            </div>
            <Link to="/admin/products" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
              <span>Catalog</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="p-5 flex-1">
            {stats.topProducts?.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-xs">
                No product sales data recorded yet
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => (
                  <div key={product.id || index} className="flex items-center gap-3.5 group">
                    <div className="relative w-11 h-13 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                      <img 
                        src={product.image || 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=100&auto=format&fit=crop&q=80'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={product.name}
                        loading="lazy"
                      />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-neutral-900 truncate group-hover:underline">
                        {product.name}
                      </h4>
                      <p className="text-[11px] font-mono text-neutral-500">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-neutral-900 font-mono">
                        {product.sales}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-medium">sold</div>
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
