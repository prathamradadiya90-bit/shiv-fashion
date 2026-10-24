import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  RefreshCw, 
  SlidersHorizontal,
  Package
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FALLBACK_IMAGE } from '../../utils/constants';
import AdminHeader from '../../components/admin/AdminHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Pagination from '../../components/admin/Pagination';
import QuickEditStockModal from '../../components/admin/QuickEditStockModal';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [quickEditProduct, setQuickEditProduct] = useState(null);

  // Filters & Pagination state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'true' | 'false'
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch unique categories for filter
  useEffect(() => {
    api.get('/products/categories')
      .then(({ data }) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        pageNumber: page,
        pageSize: pageSize,
      });

      if (search.trim()) params.append('search', search.trim());
      if (category !== 'all') params.append('category', category);
      if (statusFilter !== 'all') params.append('isActive', statusFilter);
      else params.append('isActive', 'all');

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, category, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleToggleStatus = async (product) => {
    setTogglingId(product.id);
    const updatedStatus = !product.isActive;
    try {
      await api.patch(`/products/${product.id}/status`, { isActive: updatedStatus });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: updatedStatus } : p))
      );
      toast.success(`Product is now ${updatedStatus ? 'Active' : 'Archived / Hidden'}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update product status');
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      toast.success(`Deleted "${deleteTarget.name}" successfully`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
    );
  };

  return (
    <div className="space-y-6">
      {/* Unified Header */}
      <AdminHeader
        title="Products Catalog"
        subtitle="Manage Chaniya Choli designs, pricing, Surat warehouse inventory, and live visibility"
        badge={`${totalCount} Total Items`}
        breadcrumbs={['Store', 'Products']}
        action={
          <Link
            to="/admin/products/add"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span>Add New Lehenga</span>
          </Link>
        }
      />

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-neutral-200/80 flex flex-col md:flex-row gap-3 justify-between items-center">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search designs by title or code..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-neutral-400" />
        </form>

        {/* Dropdowns Bar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter size={13} className="text-neutral-400" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-medium text-neutral-700 outline-none cursor-pointer text-xs"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-medium text-neutral-700 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Archived Only</option>
          </select>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-neutral-700 outline-none cursor-pointer"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/80 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-neutral-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-black" />
            <span className="text-xs font-semibold">Refreshing product catalog...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center text-neutral-500 space-y-3">
            <Package size={40} className="mx-auto text-neutral-300 stroke-1" />
            <p className="text-sm font-bold text-neutral-800">No matching designs found</p>
            <p className="text-xs text-neutral-400">Try adjusting your search query, filter tabs, or publish a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50/80 text-neutral-400 text-[11px] uppercase tracking-wider font-semibold border-b border-neutral-100">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Customer Price</th>
                  <th className="px-6 py-3.5">Stock Status</th>
                  <th className="px-6 py-3.5">Store Visibility</th>
                  <th className="px-6 py-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0 shadow-2xs">
                          <img
                            src={product.images?.[0]?.url || FALLBACK_IMAGE}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            alt={product.name}
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-neutral-900 truncate text-sm">{product.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-neutral-400 font-mono">#{product.id.slice(-6).toUpperCase()}</span>
                            {product.isFeatured && (
                              <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-amber-200">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-neutral-600 font-medium whitespace-nowrap">
                      {product.category}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap font-mono">
                      <div className="font-bold text-neutral-950 text-sm">
                        ₹{(product.price / 100).toFixed(2)}
                      </div>
                      {product.discount > 0 && (
                        <div className="text-[11px] text-emerald-600 font-semibold">
                          {product.discount / 100}% off
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setQuickEditProduct(product)}
                        className="group/stock flex items-center gap-1.5 text-left"
                        title="Click to quickly adjust stock"
                      >
                        <StatusBadge type="stock" status={product.stock} />
                        <span className="text-[10px] text-neutral-400 group-hover/stock:text-black group-hover/stock:underline">
                          edit
                        </span>
                      </button>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        disabled={togglingId === product.id}
                        className="transition-transform active:scale-95 disabled:opacity-50"
                        title="Toggle customer visibility"
                      >
                        <StatusBadge type="active" status={product.isActive} />
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click Quick Inventory Edit */}
                        <button
                          onClick={() => setQuickEditProduct(product)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
                          title="Quick Price & Stock Edit"
                        >
                          <SlidersHorizontal size={15} />
                        </button>

                        {/* View in Storefront */}
                        <Link
                          to={`/product/${product.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                          title="View on live website"
                        >
                          <ExternalLink size={15} />
                        </Link>

                        {/* Full Edit Form */}
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
                          title="Full Edit Details"
                        >
                          <Edit size={15} />
                        </Link>

                        {/* Delete Button */}
                        <button
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DRY Pagination Component */}
        {!loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            itemName="products"
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title="Delete Lehenga Design?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? All associated reviews and image records will be removed.`}
        confirmText="Yes, Delete Design"
        variant="danger"
      />

      {/* Quick Edit Stock & Price Modal */}
      <QuickEditStockModal
        product={quickEditProduct}
        isOpen={Boolean(quickEditProduct)}
        onClose={() => setQuickEditProduct(null)}
        onUpdated={handleProductUpdated}
      />
    </div>
  );
};

export default ProductList;
