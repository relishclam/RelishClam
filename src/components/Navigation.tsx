import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shell } from 'lucide-react';

interface NavigationProps {
  onNavigate: (path: string) => void;
}

function Navigation({ onNavigate }: NavigationProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Shell className="h-8 w-8" />
            <span className="font-bold text-xl">ClamFlow</span>
          </Link>
          
          <div className="flex space-x-4">
            <Link
              to="/production"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/production')
                  ? 'bg-blue-900 text-white'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
              onClick={() => onNavigate('/production')}
            >
              Production
            </Link>
            <Link
              to="/quality"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/quality')
                  ? 'bg-blue-900 text-white'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
              onClick={() => onNavigate('/quality')}
            >
              Quality Control
            </Link>
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/admin')
                  ? 'bg-blue-900 text-white'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
              onClick={() => onNavigate('/admin')}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;