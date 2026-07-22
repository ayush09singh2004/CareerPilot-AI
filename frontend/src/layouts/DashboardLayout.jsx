import React, { useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, PieChart, Briefcase, User, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { logout, currentUser } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard',      path: '/dashboard',       icon: <LayoutDashboard size={20} /> },
    { name: 'Resume Builder', path: '/resume-builder',  icon: <FileText size={20} /> },
    { name: 'Analysis',       path: '/analysis',        icon: <PieChart size={20} /> },
    { name: 'Job Match',      path: '/job-match',       icon: <Briefcase size={20} /> },
    { name: 'Profile',        path: '/profile',         icon: <User size={20} /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const avatarSrc = currentUser?.avatar
    ? `${API_BASE}${currentUser.avatar}`
    : null;

  return (
    <div className="h-screen bg-secondaryBg flex overflow-hidden">

      {/* ── Sidebar ── fixed height, its own scroll */}
      <aside className="w-64 bg-background border-r border-borderMain flex flex-col shrink-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-borderMain">
          <Link to="/" className="text-xl font-bold text-primary">CareerPilot AI</Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-borderMain">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-gray-600 hover:bg-red-50 hover:text-error transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Top Header — fixed within this column, never scrolls */}
        <header className="h-16 bg-background border-b border-borderMain flex items-center justify-end px-6 gap-3 shrink-0">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* User name + clickable avatar */}
          <span className="text-sm text-gray-500 hidden sm:block">
            {currentUser?.fullName || 'User'}
          </span>
          <Link
            to="/profile"
            title="Go to Profile"
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors shrink-0"
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {currentUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </Link>
        </header>

        {/* Page content — the ONE and ONLY scroll container for every page */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
