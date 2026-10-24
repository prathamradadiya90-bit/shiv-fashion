import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ProductForm from '../../components/admin/ProductForm';

const AddProduct = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleCreateProduct = async (productData) => {
    setSubmitting(true);
    try {
      await api.post('/products', productData);
      toast.success('Product created successfully!');
      navigate('/admin/products');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProductForm
      mode="add"
      onSubmit={handleCreateProduct}
      submitting={submitting}
    />
  );
};

export default AddProduct;
