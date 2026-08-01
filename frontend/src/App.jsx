import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Store Pages
import Home from './pages/store/Home';
import Shop from './pages/store/Shop';
import ContactUs from './pages/store/ContactUs';
import ProductDetails from './pages/store/ProductDetails';
import Login from './pages/store/Login';
import Register from './pages/store/Register';
import Cart from './pages/store/Cart';
import Shipping from './pages/store/Shipping';
import PlaceOrder from './pages/store/PlaceOrder';
import Order from './pages/store/Order';
import Profile from './pages/store/Profile';
import MyOrders from './pages/store/MyOrders';
import Wishlist from './pages/store/Wishlist';
import TrackOrder from './pages/store/TrackOrder';

import StoreLayout from './components/store/StoreLayout';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Messages from './pages/admin/Messages';
import ProductList from './pages/admin/ProductList';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import OrderList from './pages/admin/OrderList';
import CustomerList from './pages/admin/CustomerList';
import CouponList from './pages/admin/CouponList';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Store Routes */}
        <Route path="/" element={<StoreLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="placeorder" element={<PlaceOrder />} />
          <Route path="order/:id" element={<Order />} />
          <Route path="profile" element={<Profile />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="track-order" element={<TrackOrder />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/:id/edit" element={<EditProduct />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="messages" element={<Messages />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="coupons" element={<CouponList />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <ToastContainer position="bottom-right" />
    </Router>
  );
}

export default App;
