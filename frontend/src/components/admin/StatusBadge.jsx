import { 
  Clock, 
  CheckCircle2, 
  Truck, 
  PackageCheck, 
  XCircle, 
  AlertTriangle, 
  Ban, 
  ShieldCheck, 
  Tag 
} from 'lucide-react';

export const StatusBadge = ({ type = 'order', status }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  // Order status configuration
  if (type === 'order') {
    switch (normalized) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} className="text-amber-500" />
            <span>Pending</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 size={12} className="text-blue-500" />
            <span>Confirmed</span>
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Truck size={12} className="text-indigo-500" />
            <span>Shipped</span>
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PackageCheck size={12} className="text-emerald-500" />
            <span>Delivered</span>
          </span>
        );
      case 'CANCELLED':
      case 'CANCEL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} className="text-rose-500" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span>{status}</span>
          </span>
        );
    }
  }

  // Stock status configuration
  if (type === 'stock') {
    const stockCount = Number(status) || 0;
    if (stockCount <= 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle size={11} /> Out of Stock
        </span>
      );
    }
    if (stockCount <= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle size={11} /> Only {stockCount} left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={11} /> {stockCount} in stock
      </span>
    );
  }

  // Active / Inactive switch
  if (type === 'active') {
    const isActive = Boolean(status === true || status === 'true' || status === 'Active');
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
        isActive 
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
          : 'bg-neutral-100 text-neutral-600 border-neutral-200'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
        <span>{isActive ? 'Active' : 'Archived'}</span>
      </span>
    );
  }

  // Customer status (Active / Blocked)
  if (type === 'user') {
    const isBlocked = status === 'Blocked';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
        isBlocked 
          ? 'bg-rose-50 text-rose-700 border-rose-200' 
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}>
        {isBlocked ? <Ban size={11} /> : <ShieldCheck size={11} />}
        <span>{isBlocked ? 'Blocked' : 'Active'}</span>
      </span>
    );
  }

  // Coupon discount badge
  if (type === 'coupon') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-100 text-black border border-neutral-300">
        <Tag size={11} />
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
      {status}
    </span>
  );
};

export default StatusBadge;
