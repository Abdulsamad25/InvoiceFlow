import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/common/Button';
import { ROUTES } from '../utils/constants';

const NotFound = () => {
  return (
    <div className="flex justify-center items-center bg-white p-4 min-h-screen">
      <div className="text-center">
        <h1 className="font-bold text-rose-400 text-9xl">404</h1>
        <h2 className="mt-4 mb-2 font-bold text-gray-900 text-3xl">Page Not Found</h2>
        <p className="mb-8 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="primary" icon={<Home className="w-5 h-5" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;