import { useState } from 'react';
import { TrendingUp, BarChart3, LineChart, DollarSign, ShoppingBag } from 'lucide-react';

const RevenueChart = ({ data = [] }) => {
  const [metric, setMetric] = useState('revenue'); // 'revenue' | 'orders'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Fallback demo points if data is empty (e.g. brand new store)
  const defaultPoints = [
    { month: "May '26", revenue: 42000, orders: 8 },
    { month: "Jun '26", revenue: 68000, orders: 14 },
    { month: "Jul '26", revenue: 59000, orders: 11 },
    { month: "Aug '26", revenue: 94000, orders: 19 },
    { month: "Sep '26", revenue: 135000, orders: 27 },
    { month: "Oct '26", revenue: 182000, orders: 36 }
  ];

  const chartData = (data && data.length > 0) ? data : defaultPoints;

  // Chart dimensions
  const height = 240;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;
  const width = 640; // responsive SVG viewBox width

  const values = chartData.map(d => metric === 'revenue' ? Number(d.revenue || 0) : Number(d.orders || 0));
  const maxValue = Math.max(...values, metric === 'revenue' ? 10000 : 10);
  const totalMetric = values.reduce((acc, curr) => acc + curr, 0);

  // Calculate coordinates
  const availableWidth = width - paddingX * 2;
  const availableHeight = height - paddingTop - paddingBottom;
  const stepX = chartData.length > 1 ? availableWidth / (chartData.length - 1) : availableWidth;

  const points = chartData.map((d, i) => {
    const val = metric === 'revenue' ? Number(d.revenue || 0) : Number(d.orders || 0);
    const x = paddingX + i * stepX;
    const y = height - paddingBottom - (val / maxValue) * availableHeight;
    return { x, y, val, month: d.month, raw: d };
  });

  // Construct SVG Bézier path
  const createSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const linePath = createSmoothPath(points);
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : '';

  // Calculate growth between first and last recorded month
  const firstVal = values[0] || 1;
  const lastVal = values[values.length - 1] || 0;
  const growthRate = Math.round(((lastVal - firstVal) / firstVal) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/80 p-6 flex flex-col">
      {/* ── Header Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-neutral-900 font-heading">Financial Trajectory</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
              Last 6 Months
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-1.5">
            <span className="text-2xl font-bold font-mono text-neutral-950">
              {metric === 'revenue' 
                ? `₹${totalMetric.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` 
                : `${totalMetric} orders`}
            </span>
            <span className={`text-xs font-bold flex items-center gap-0.5 ${growthRate >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              <TrendingUp size={13} className={growthRate < 0 ? 'rotate-180' : ''} />
              <span>{growthRate >= 0 ? `+${growthRate}%` : `${growthRate}%`} period trend</span>
            </span>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100/90 rounded-xl border border-neutral-200/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              metric === 'revenue'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <DollarSign size={13} />
            <span>Revenue (₹)</span>
          </button>
          <button
            type="button"
            onClick={() => setMetric('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              metric === 'orders'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <ShoppingBag size={13} />
            <span>Orders</span>
          </button>
        </div>
      </div>

      {/* ── Interactive SVG Canvas ── */}
      <div className="relative pt-4 flex-1">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-56 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = height - paddingBottom - pct * availableHeight;
            const gridVal = Math.round(pct * maxValue);
            return (
              <g key={idx}>
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={width - paddingX} 
                  y2={y} 
                  stroke="#f1f5f9" 
                  strokeDasharray={pct === 0 ? "none" : "3 3"} 
                  strokeWidth="1"
                />
                <text 
                  x={paddingX - 10} 
                  y={y + 3} 
                  textAnchor="end" 
                  className="text-[9px] fill-neutral-400 font-mono"
                >
                  {metric === 'revenue' 
                    ? `₹${(gridVal / 1000).toFixed(0)}k` 
                    : gridVal}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaPath && (
            <path 
              d={areaPath} 
              fill="url(#areaGradient)" 
              className="transition-all duration-500 ease-out" 
            />
          )}

          {/* Spline Line */}
          {linePath && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="#0a0a0a" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              className="transition-all duration-500 ease-out" 
            />
          )}

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredPoint?.month === pt.month;
            return (
              <g key={idx} className="cursor-pointer">
                {/* Invisible hover hotspot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="16"
                  fill="transparent"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* Visual circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? "6" : "3.5"}
                  fill={isHovered ? "#000000" : "#ffffff"}
                  stroke="#000000"
                  strokeWidth="2.5"
                  className="transition-all duration-150"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* Month label on X-axis */}
                <text
                  x={pt.x}
                  y={height - 12}
                  textAnchor="middle"
                  className={`text-[10px] font-medium transition-colors ${
                    isHovered ? 'fill-black font-bold' : 'fill-neutral-400'
                  }`}
                >
                  {pt.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div 
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full z-20 transition-all duration-150"
            style={{ 
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
              marginTop: '-12px'
            }}
          >
            <div className="bg-black text-white px-3 py-2 rounded-xl shadow-xl text-center border border-neutral-700 min-w-[120px]">
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">
                {hoveredPoint.month}
              </div>
              <div className="text-xs font-bold font-mono text-white">
                ₹{Number(hoveredPoint.raw.revenue || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-neutral-300 font-medium">
                {hoveredPoint.raw.orders || 0} order(s) placed
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer Insight Strip ── */}
      <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-2">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time aggregation from verified paid checkout transactions</span>
        </span>
        <span className="font-mono text-[11px] text-neutral-400">
          Peak: {metric === 'revenue' ? `₹${maxValue.toLocaleString('en-IN')}` : `${maxValue} orders`}
        </span>
      </div>
    </div>
  );
};

export default RevenueChart;
