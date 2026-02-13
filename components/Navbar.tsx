import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Plus, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  
  // Hide navbar on verification page for a cleaner "app-like" experience for the scanner
  if (location.pathname.startsWith('/verify')) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900 hidden sm:block">SafeCampus ID</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${isActive('/')}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/add" 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${isActive('/add')}`}
            >
              <Plus className="h-4 w-4" />
              <span>New Student</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};