import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import WhatsAppButton from '../common/WhatsAppButton';

const StoreLayout = () => {
  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default StoreLayout;
