import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'estimator':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-khc-primary shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-khc-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">QS</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:inline">QSCostingPro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Home Link */}
            <Link
              to="/dashboard"
              className="text-khc-light hover:bg-khc-secondary px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Home
            </Link>

            {/* Projects Dropdown */}
            <div className="relative group">
              <button className="text-khc-light hover:bg-khc-secondary px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1">
                Projects
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              <div className="absolute left-0 mt-0 w-40 bg-white rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link to="/projects?filter=new" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">New</Link>
                <Link to="/projects?filter=current" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Current</Link>
                <Link to="/projects?filter=completed" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Completed</Link>
              </div>
            </div>

            {/* Clients Dropdown */}
            <div className="relative group">
              <button className="text-khc-light hover:bg-khc-secondary px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1">
                Clients
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              <div className="absolute left-0 mt-0 w-40 bg-white rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link to="/clients?filter=new" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">New</Link>
                <Link to="/clients?filter=existing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Existing</Link>
              </div>
            </div>

            {/* Contractors Dropdown */}
            <div className="relative group">
              <button className="text-khc-light hover:bg-khc-secondary px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1">
                Contractors
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              <div className="absolute left-0 mt-0 w-40 bg-white rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link to="/contractors?filter=new" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">New</Link>
                <Link to="/contractors?filter=existing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Existing</Link>
              </div>
            </div>

            {/* Estimate Builder Dropdown */}
            <div className="relative group">
              <button className="text-khc-light hover:bg-khc-secondary px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1">
                Estimate Builder
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              <div className="absolute left-0 mt-0 w-56 bg-white rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link to="/cost-assembly" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-semibold text-khc-primary">Build Estimate</Link>
                <div className="border-t border-gray-200 my-1"></div>
                <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Rates Database</div>
                <Link to="/personal-database" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 pl-8">Upload Rates</Link>
                <Link to="/internal-rates" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 pl-8">Build Rates</Link>
              </div>
            </div>

          </nav>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            {/* User Dropdown */}
            <div className="hidden sm:block relative group">
              <button className="flex items-center space-x-2 text-khc-light hover:bg-khc-secondary px-3 py-2 rounded-md transition">
                <div className="w-8 h-8 bg-khc-accent rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{user?.username.charAt(0).toUpperCase()}</span>
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium">{user?.username}</span>
                  <p className="text-xs text-khc-light">{user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}</p>
                </div>
              </button>
              <div className="absolute right-0 mt-0 w-40 bg-white rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link to="/referrals" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Referrals</Link>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-khc-light hover:bg-khc-secondary p-2 rounded-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {/* Home Link */}
            <Link
              to="/dashboard"
              className="text-khc-light hover:bg-khc-secondary block px-3 py-2 rounded-md text-base font-medium transition"
            >
              Home
            </Link>

            {/* Projects */}
            <div>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'projects' ? null : 'projects')}
                className="w-full text-left text-khc-light hover:bg-khc-secondary block px-3 py-2 rounded-md text-base font-medium transition flex items-center justify-between"
              >
                Projects
                <svg className={`w-4 h-4 transition-transform ${openDropdown === 'projects' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {openDropdown === 'projects' && (
                <div className="bg-khc-secondary/20 space-y-1">
                  <Link to="/projects?filter=new" className="text-khc-light block px-6 py-2 rounded-md text-sm font-medium">New</Link>
                  <Link to="/projects?filter=current" className="text-khc-light block px-6 py-2 rounded-md text-sm font-medium">Current</Link>
                  <Link to="/projects?filter=completed" className="text-khc-light block px-6 py-2 rounded-md text-sm font-medium">Completed</Link>
                </div>
              )}
            </div>

            {/* Clients */}
            <div>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'clients' ? null : 'clients')}
                className="w-full text-left text-khc-light hover:bg-khc-secondary block px-3 py-2 rounded-md text-base font-medium transition flex items-center justify-between"
              >
                Clients
                <svg className={`w-4 h-4 transition-transform ${openDropdown === 'clients' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {openDropdown === 'clients' && (
                <div className="bg-khc-secondary/20 space-y-1">
                  <Link to="/clients?filter=new" className="text-khc-light block px-6 py-2 rounded-md text-sm font-medium">New</Link>
                  <Link to="/clients?filter=existing" className="text-khc-light block px-6 py-2 rounded-md text-sm font-medium">Existing</Link>
                </div>
              )}
            </div>

            {/* Contractors */}
            <div>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'contractors' ? null : 'contractors')}
                className="w-full text-left text-khc-light hover:bg-khc-secondary block px-3 py-2 rounded-md text-base font-medium transition flex items-center justify-between"
              >
                Contractors
                <svg className={`w-4 h-4 transition-transform ${openDropdown === 'contractors' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {openDropdown === 'contractors' && (
                <div className="bg-khc-secondary/20 space-y-1">
                  <Link to="/contractors?filter=new" className="text-khc-light block px-6 py-2 rounded-md text-sm font-medium">New</Link>
                  <Link to="/contractors?filter=existing" className="text-khc-light block px-6 py-2 rounded-md text-sm font-medium">Existing</Link>
                </div>
              )}
            </div>

            {/* Estimate Builder */}
            <div>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'estimates' ? null : 'estimates')}
                className="w-full text-left text-khc-light hover:bg-khc-secondary block px-3 py-2 rounded-md text-base font-medium transition flex items-center justify-between"
              >
                Estimate Builder
                <svg className={`w-4 h-4 transition-transform ${openDropdown === 'estimates' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {openDropdown === 'estimates' && (
                <div className="bg-khc-secondary/20 space-y-1">
                  <Link to="/cost-assembly" className="text-khc-light block px-6 py-2 rounded-md text-sm font-semibold">Build Estimate</Link>
                  <div className="px-6 py-2 text-xs font-semibold text-khc-light uppercase opacity-75">Rates Database</div>
                  <Link to="/personal-database" className="text-khc-light block px-8 py-2 rounded-md text-sm font-medium">Upload Rates</Link>
                  <Link to="/internal-rates" className="text-khc-light block px-8 py-2 rounded-md text-sm font-medium">Build Rates</Link>
                </div>
              )}
            </div>

            {/* Mobile User Menu */}
            <div className="border-t border-khc-secondary mt-4 pt-4 space-y-1">
              <Link
                to="/referrals"
                className="text-khc-light hover:bg-khc-secondary block px-3 py-2 rounded-md text-base font-medium transition"
              >
                Referrals
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left text-red-400 hover:text-red-300 block px-3 py-2 rounded-md text-base font-medium transition"
              >
                Logout
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
