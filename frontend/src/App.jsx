import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components (Keep these synchronous as they are used immediately/globally)
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import StoreLayout from './components/store/StoreLayout';
import AdminLayout from './components/admin/AdminLayout';

// Loading Fallback
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

// Lazy Load Store Pages
const Home = lazy(() => import('./pages/store/Home'));
const Shop = lazy(() => import('./pages/store/Shop'));
const ContactUs = lazy(() => import('./pages/store/ContactUs'));
const ProductDetails = lazy(() => import('./pages/store/ProductDetails'));
const Login = lazy(() => import('./pages/store/Login'));
const Register = lazy(() => import('./pages/store/Register'));
const ForgotPassword = lazy(() => import('./pages/store/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/store/ResetPassword'));
const Cart = lazy(() => import('./pages/store/Cart'));
const Shipping = lazy(() => import('./pages/store/Shipping'));
const PlaceOrder = lazy(() => import('./pages/store/PlaceOrder'));
const Order = lazy(() => import('./pages/store/Order'));
const Profile = lazy(() => import('./pages/store/Profile'));
const MyOrders = lazy(() => import('./pages/store/MyOrders'));
const Wishlist = lazy(() => import('./pages/store/Wishlist'));
const TrackOrder = lazy(() => import('./pages/store/TrackOrder'));
const About = lazy(() => import('./pages/store/About'));
const PrivacyPolicy = lazy(() => import('./pages/store/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/store/Terms'));
const ReturnPolicy = lazy(() => import('./pages/store/ReturnPolicy'));
const Notifications = lazy(() => import('./pages/store/Notifications'));

// Lazy Load Admin Pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Messages = lazy(() => import('./pages/admin/Messages'));
const ProductList = lazy(() => import('./pages/admin/ProductList'));
const AddProduct = lazy(() => import('./pages/admin/AddProduct'));
const EditProduct = lazy(() => import('./pages/admin/EditProduct'));
const OrderList = lazy(() => import('./pages/admin/OrderList'));
const CustomerList = lazy(() => import('./pages/admin/CustomerList'));
const CouponList = lazy(() => import('./pages/admin/CouponList'));
const Settings = lazy(() => import('./pages/admin/Settings'));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Store Routes */}
          <Route path="/" element={<StoreLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
            <Route path="shipping" element={<PrivateRoute><Shipping /></PrivateRoute>} />
            <Route path="placeorder" element={<PrivateRoute><PlaceOrder /></PrivateRoute>} />
            <Route path="order/:id" element={<PrivateRoute><Order /></PrivateRoute>} />
            <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
            <Route path="wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
            <Route path="notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            <Route path="track-order" element={<TrackOrder />} />
            <Route path="about" element={<About />} />
            <Route path="faq" element={<About />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="returns" element={<ReturnPolicy />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
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
      </Suspense>
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000} 
        limit={2} 
        transition={Slide} 
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;
