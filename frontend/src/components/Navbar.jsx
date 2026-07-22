import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-borderMain">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          CareerPilot AI
        </Link>

        <div className="hidden md:flex space-x-8">
          <Link to="/"       className="text-gray-600 hover:text-primary transition-colors">Home</Link>
          <a href="/#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
          <a href="/#about"    className="text-gray-600 hover:text-primary transition-colors">About</a>
        </div>

        <div className="flex items-center space-x-3">
          {/* Dark / Light toggle visible on landing & auth pages */}
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="px-5 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-full bg-red-50 text-error hover:bg-red-100 transition-colors shadow-soft font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 rounded-full bg-primary text-white hover:bg-blue-700 transition-colors shadow-soft font-medium"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
