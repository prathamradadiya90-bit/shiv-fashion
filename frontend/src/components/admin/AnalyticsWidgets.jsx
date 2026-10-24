import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Sparkles, 
  Clock, 
  Truck, 
  PackageCheck, 
  XCircle,
  Layers
} from 'lucide-react';

export const CategoryPerformanceWidget = ({ categories = [] }) => {
  // Default sample categories if brand new database
  const demoCategories = [
    { category: 'Navratri Chaniya Choli', revenue: 245000, units: 48 },
    { category: 'Bridal Heritage Lehengas', revenue: 198000, units: 14 },
    { category: 'Traditional Bandhani', revenue: 112000, units: 26 },
    { category: 'Designer Silk & Organza', revenue: 84000, units: 18 }
  ];

  const categoryList = (categories && categories.length > 0) ? categories : demoCategories;
  const totalCategoryRevenue = categoryList.reduce((acc, c) => acc + c.revenue, 0);

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/80 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 font-heading">Category Revenue Share</h3>
            <p className="text-xs text-neutral-400">Sales volume by ethnic garment category</p>
          </div>
          <Link 
            to="/admin/products" 
            className="text-xs font-bold text-black hover:underline flex items-center gap-1"
          >
            <span>Catalog</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="space-y-4 pt-4">
          {categoryList.map((item, idx) => {
            const share = totalCategoryRevenue > 0 
              ? Math.round((item.revenue / totalCategoryRevenue) * 100) 
              : 0;

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-black" />
                    <span>{item.category}</span>
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-neutral-950">
                      ₹{Number(item.revenue).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-neutral-400">({share}%)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div 
                    className="h-full bg-black rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(share, 4)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>{item.units} pieces sold</span>
                  <span>Avg ~₹{item.units > 0 ? Math.round(item.revenue / item.units).toLocaleString('en-IN') : 0}/item</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center justify-between">
        <span className="flex items-center gap-1 font-medium">
          <Layers size={13} className="text-neutral-400" />
          <span>Surat Artisan Direct</span>
        </span>
        <span className="font-mono font-bold text-neutral-900">
          ₹{totalCategoryRevenue.toLocaleString('en-IN')} Total
        </span>
      </div>
    </div>
  );
};

export const FulfillmentHealthWidget = ({ statusBreakdown = {}, fulfillmentRate = 0, averageOrderValue = 0 }) => {
  const pending = statusBreakdown.PENDING || 0;
  const confirmed = statusBreakdown.CONFIRMED || 0;
  const shipped = statusBreakdown.SHIPPED || 0;
  const delivered = statusBreakdown.DELIVERED || 0;
  const cancelled = statusBreakdown.CANCELLED || 0;

  const total = Math.max(pending + confirmed + shipped + delivered + cancelled, 1);

  const statuses = [
    { label: 'Delivered', count: delivered, color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', icon: PackageCheck },
    { label: 'Shipped', count: shipped, color: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50', icon: Truck },
    { label: 'Confirmed', count: confirmed, color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', icon: Sparkles },
    { label: 'Pending', count: pending, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
    { label: 'Cancelled', count: cancelled, color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', icon: XCircle }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/80 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 font-heading">Fulfillment Health</h3>
            <p className="text-xs text-neutral-400">Order pipeline and dispatch efficiency</p>
          </div>
          <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{fulfillmentRate}% Success</span>
          </div>
        </div>

        {/* Stacked Pipeline Visualizer */}
        <div className="pt-4">
          <div className="w-full h-3 rounded-full bg-neutral-100 overflow-hidden flex shadow-inner">
            {statuses.map((s, idx) => {
              const widthPct = (s.count / total) * 100;
              if (widthPct === 0) return null;
              return (
                <div 
                  key={idx} 
                  className={`h-full ${s.color} transition-all duration-500`}
                  style={{ width: `${widthPct}%` }}
                  title={`${s.label}: ${s.count} (${Math.round(widthPct)}%)`}
                />
              );
            })}
          </div>
        </div>

        {/* Breakdown Chips */}
        <div className="grid grid-cols-2 gap-2.5 pt-4">
          {statuses.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={idx} 
                className="p-2.5 rounded-xl border border-neutral-100 bg-neutral-50/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg ${s.bg} ${s.text} flex items-center justify-center`}>
                    <Icon size={12} />
                  </div>
                  <span className="text-xs font-medium text-neutral-700">{s.label}</span>
                </div>
                <span className="text-xs font-bold font-mono text-neutral-900">{s.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Ratios Bottom Bar */}
      <div className="pt-4 mt-4 border-t border-neutral-100 grid grid-cols-2 gap-3 text-center">
        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Average Order Value</div>
          <div className="text-base font-bold font-mono text-neutral-950">₹{averageOrderValue.toLocaleString('en-IN')}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Pipeline Volume</div>
          <div className="text-base font-bold font-mono text-neutral-950">{pending + confirmed + shipped} in transit</div>
        </div>
      </div>
    </div>
  );
};
