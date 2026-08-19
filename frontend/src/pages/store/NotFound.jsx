import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import SEO from '../../components/common/SEO';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <SEO title="Page Not Found | Shreeji Fashion" />
      <h1 className="text-9xl font-heading font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Page Not Found</h2>
      <p className="text-gray-500 max-w-md mb-8">
        We're sorry, the page you requested could not be found. Please go back to the homepage or contact us if you need help.
      </p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        <Home size={20} />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
