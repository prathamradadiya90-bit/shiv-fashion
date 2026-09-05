import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, ShoppingBag } from 'lucide-react';
import { addToCart, removeFromCart } from '../../store/slices/cartSlice';
import { FALLBACK_IMAGE, MAX_QUANTITY, FREE_SHIPPING_THRESHOLD, SHIPPING_CHARGE } from '../../utils/constants';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);

  const checkoutHandler = () => {
    navigate('/shipping'); // Will redirect to login if not logged in via PrivateRoute
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((a, c) => a + c.quantity, 0);
  }, [cartItems]);

  const handleUpdateQuantity = (item, newQuantity) => {
    const validQuantity = Math.max(1, Math.min(newQuantity, item.stock || MAX_QUANTITY));
    dispatch(addToCart({ ...item, quantity: validQuantity }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold text-primary mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shop" className="btn-primary inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-grow">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden sm:grid grid-cols-6 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                <div className="col-span-3">Product</div>
                <div className="col-span-1 text-center">Price</div>
                <div className="col-span-1 text-center">Quantity</div>
                <div className="col-span-1 text-right">Total</div>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="p-4 flex flex-col sm:grid sm:grid-cols-6 items-center gap-4">
                    
                    {/* Product Info */}
                    <div className="col-span-3 flex items-center w-full">
                      <img src={item.image || FALLBACK_IMAGE} alt={item.name} loading="lazy" className="w-20 h-24 object-cover rounded" />
                      <div className="ml-4">
                        <Link to={`/product/${item.id}`} className="font-bold text-gray-800 hover:text-primary transition-colors">
                          {item.name}
                        </Link>
                        <div className="text-sm text-gray-500 mt-1">
                          Size: {item.size} | Color: {item.color}
                        </div>
                        <button 
                          onClick={() => dispatch(removeFromCart(item))}
                          className="text-red-500 text-sm mt-2 flex items-center hover:underline"
                        >
                          <Trash2 size={14} className="mr-1" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Price (Desktop) */}
                    <div className="hidden sm:block col-span-1 text-center font-medium">
                      ₹{item.price}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-1 flex justify-center w-full sm:w-auto">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button 
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)} 
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >-</button>
                        <span className="px-3 font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)} 
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >+</button>
                      </div>
                    </div>

                    {/* Total & Price (Mobile flex) */}
                    <div className="col-span-1 flex justify-between w-full sm:w-auto sm:block text-right font-bold text-primary">
                      <span className="sm:hidden text-gray-500 font-normal">Total:</span>
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold border-b border-gray-100 pb-4 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItemsCount} items)</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span className="font-medium">₹{SHIPPING_CHARGE}</span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-primary">₹{subtotal >= FREE_SHIPPING_THRESHOLD ? subtotal : subtotal + SHIPPING_CHARGE}</span>
                </div>
              </div>

              <button 
                onClick={checkoutHandler}
                className="w-full btn-primary text-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
