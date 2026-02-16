import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, ScanLine } from 'lucide-react';
import { setAuthStatus } from '../utils/firestore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we are on a public page
  const isPublic = location.pathname.startsWith('/verify') || location.pathname === '/login';

  const handleLogout = () => {
    setAuthStatus(false);
    navigate('/login');
  };

  if (isPublic) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const navItems = [
    { label: 'Employees', icon: <Users size={20} />, path: '/admin' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-2">
           <div className="bg-indigo-600 p-2 rounded-lg">
             <ScanLine className="text-white w-6 h-6" />
           </div>
           <span className="text-xl font-bold text-gray-900">IDVerify</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
         <div className="flex items-center space-x-2">
           <div className="bg-indigo-600 p-1.5 rounded-lg">
             <ScanLine className="text-white w-5 h-5" />
           </div>
           <span className="text-lg font-bold text-gray-900">IDVerify</span>
         </div>
         <button onClick={handleLogout} className="text-gray-500">
            <LogOut size={20} />
         </button>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-20">
         {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 text-xs font-medium rounded-lg ${
                  isActive ? 'text-indigo-600' : 'text-gray-500'
                }`}
              >
                {item.icon}
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-16 md:mb-0">
        {children}
      </main>
    </div>
  );
};
