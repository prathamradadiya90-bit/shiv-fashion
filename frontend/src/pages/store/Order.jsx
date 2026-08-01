import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle, Truck } from 'lucide-react';
import api from '../../services/api';

const Order = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading order...</div>;
  if (!order) return <div className="text-center py-20 text-red-500 font-bold">Order Not Found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl flex items-center mb-8">
        <CheckCircle size={32} className="mr-4 text-green-500" />
        <div>
          <h2 className="text-xl font-bold">Order Confirmed</h2>
          <p>Thank you for your purchase! Your order ID is <strong>{order.id}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 pb-2 border-b">Shipping Summary</h3>
          <p><strong>Status:</strong> <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold uppercase">{order.status}</span></p>
          {order.trackingNumber && (
            <p className="mt-2 text-primary"><strong>Tracking No:</strong> {order.trackingNumber}</p>
          )}
          <p className="mt-2"><strong>Address:</strong> {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 pb-2 border-b">Payment Summary</h3>
          <p><strong>Status:</strong> <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold uppercase">{order.paymentStatus}</span></p>
          <p className="mt-2"><strong>Total Amount:</strong> <span className="font-bold text-primary">₹{order.totalAmount}</span></p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg mb-4 pb-2 border-b">Order Items</h3>
        <div className="divide-y divide-gray-100">
          {order.items.map((item, index) => (
            <div key={index} className="py-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">{item.product.name}</p>
                <p className="text-sm text-gray-500">Size: {item.size} | Color: {item.color}</p>
              </div>
              <div className="font-medium">
                {item.quantity} x ₹{item.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Order;
