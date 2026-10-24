import { ChevronRight } from 'lucide-react';

export const AdminHeader = ({
  title,
  subtitle,
  badge,
  action,
  breadcrumbs = [],
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
      <div>
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight size={11} className="text-neutral-400" />}
                <span className={idx === breadcrumbs.length - 1 ? 'text-neutral-800 font-semibold' : 'hover:text-neutral-600'}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-neutral-950 font-heading tracking-tight">{title}</h2>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {action && (
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {action}
        </div>
      )}
    </div>
  );
};

export default AdminHeader;
