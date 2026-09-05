import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, Filter, ChevronLeft, ChevronRight, CheckCircle, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FALLBACK_IMAGE } from '../../utils/constants';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

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
      toast.success(`Product is now ${updatedStatus ? 'Active' : 'Inactive / Archived'}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update product status');
    } finally {
      setTogglingId(null);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product permanently?')) {
      setDeletingId(id);
      try {
        await api.delete(`/products/${id}`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to delete product');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Products Management</h2>
          <p className="text-sm text-gray-500">Manage catalog, pricing, inventory stock, and availability</p>
        </div>
        <Link
          to="/admin/products/add"
          className="bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-all flex items-center font-medium shadow-sm"
        >
          <Plus size={18} className="mr-2" /> Add New Product
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products by name..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </form>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary py-2 px-3 bg-white"
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
            className="text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary py-2 px-3 bg-white"
          >
            <option value="all">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive / Archived</option>
          </select>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary py-2 px-3 bg-white"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-primary" />
            <span>Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-base font-medium text-gray-700 mb-1">No products found</p>
            <p className="text-xs text-gray-400">Try adjusting your search query or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Image</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Stock</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={product.images?.[0]?.url || FALLBACK_IMAGE}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-100 shadow-xs"
                        alt={product.name}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 line-clamp-1">{product.name}</div>
                      {product.isFeatured && (
                        <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{product.category}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                      ₹{(product.price / 100).toFixed(2)}
                      {product.discount > 0 && (
                        <span className="ml-2 text-xs text-green-600 font-normal">
                          ({product.discount / 100}% off)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          product.stock > 5
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : product.stock > 0
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        disabled={togglingId === product.id}
                        className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all ${
                          product.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } disabled:opacity-50`}
                        title="Click to toggle status"
                      >
                        {product.isActive ? (
                          <>
                            <CheckCircle size={12} /> Active
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/product/${product.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-400 hover:text-gray-700 p-1"
                          title="View on store"
                        >
                          <ExternalLink size={17} />
                        </Link>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit product"
                        >
                          <Edit size={17} />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-800 p-1 disabled:opacity-40 disabled:cursor-not-allowed"
                          onClick={() => deleteHandler(product.id)}
                          disabled={deletingId === product.id}
                          title="Delete product"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <div>
              Showing <span className="font-semibold">{Math.min((page - 1) * pageSize + 1, totalCount)}</span> to{' '}
              <span className="font-semibold">{Math.min(page * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> products
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1 px-2 font-medium">
                Page {page} of {totalPages}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
