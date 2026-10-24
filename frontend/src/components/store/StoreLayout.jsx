import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import FloatingActions from '../common/FloatingActions';
import MobileBottomNav from '../common/MobileBottomNav';

const StoreLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900 pb-16 md:pb-0 animate-fade-in">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <FloatingActions />
      <MobileBottomNav />
    </div>
  );
};

export default StoreLayout;
