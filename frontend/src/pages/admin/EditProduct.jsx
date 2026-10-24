import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import ProductForm from '../../components/admin/ProductForm';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setInitialData(data);
      } catch {
        toast.error('Product not found or unavailable');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleUpdateProduct = async (productData) => {
    setSubmitting(true);
    try {
      await api.put(`/products/${id}`, productData);
      toast.success('Product updated successfully!');
      navigate('/admin/products');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-neutral-500">
        <RefreshCw size={28} className="animate-spin text-black" />
        <span className="text-sm font-medium">Loading product details...</span>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-base font-bold text-neutral-800">Product not found</p>
        <Link to="/admin/products" className="text-xs text-black underline font-bold flex items-center justify-center gap-1">
          <ArrowLeft size={14} /> Back to Products List
        </Link>
      </div>
    );
  }

  return (
    <ProductForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleUpdateProduct}
      submitting={submitting}
    />
  );
};

export default EditProduct;
