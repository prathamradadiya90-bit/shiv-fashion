import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UploadCloud } from 'lucide-react';
import api from '../../services/api';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);

  const navigate = useNavigate();

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/upload', formData, config);
      setImage({ url: data.url, publicId: data.publicId });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        name,
        price: Number(price),
        discount: Number(discount),
        description,
        category,
        stock: Number(stock),
        isFeatured,
        images: image ? [image] : [],
        sizes: sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: colors.split(',').map(c => {
          const [colorName, hex] = c.split(':');
          return colorName ? { name: colorName.trim(), hexCode: hex ? hex.trim() : '#000000' } : null;
        }).filter(Boolean),
      });
      toast.success('Product created successfully');
      navigate('/admin/products');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create product');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
        <button onClick={() => navigate('/admin/products')} className="text-gray-500 hover:text-gray-700 font-medium">
          Back to Products
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={submitHandler} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary"
              >
                <option value="">Select Category</option>
                <option value="Bridal">Bridal</option>
                <option value="Navratri Special">Navratri Special</option>
                <option value="Party Wear">Party Wear</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input 
                type="number" 
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input 
                type="number" 
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input 
                type="number" 
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma separated)</label>
              <input 
                type="text" 
                placeholder="e.g. S, M, L, XL"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Colors (Name:Hex, comma separated)</label>
              <input 
                type="text" 
                placeholder="e.g. Red:#FF0000, Blue:#0000FF"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="isFeatured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
              Featured Product
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              required
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative group">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                    <span>Upload a file</span>
                    <input type="file" className="sr-only" onChange={uploadFileHandler} accept="image/*" />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                {uploading && <p className="text-xs text-blue-500 font-bold mt-2">Uploading...</p>}
                {image && <p className="text-xs text-green-500 font-bold mt-2">Image Uploaded Successfully</p>}
              </div>
            </div>
          </div>

          <button type="submit" className="w-full btn-primary text-lg">
            Create Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
