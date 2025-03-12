import React, { useState, useEffect } from 'react';
import { UserCircle, ListTodo } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGoals } from '../../context/GoalContext';
import '../../styles/navbar.css';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { clearGoals } = useGoals();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  
  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/settings', label: 'Settings' },
  ];

  const handleSignOut = async () => {
    try {
      clearGoals();
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Identify when the user scrolls down
  const handleScroll = () => {
    if (window.scrollY > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  // Add event listener for scroll events
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`sticky-navbar ${isScrolled ? 'scrolled' : ''} shadow-md`}>
      <div className="max-w-auto mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-12">
            <Link to="/" className="flex items-center text-2xl font-bold text-text-light dark:text-text-dark gap-2">
              <ListTodo size={30} strokeWidth={2}/>
              <img src="/logo_goalist.png" alt="Goalist" className="h-6 md:h-7 w-auto"/>
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <div className="nav-links relative">
                <div
                  className="absolute h-1 bg-primary-light transition-all duration-300"
                />
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === link.path 
                        ? 'bg-primary-light/10 text-primary-light dark:text-primary-dark' 
                        : 'text-text-light dark:text-text-dark hover:bg-primary-light/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className="flex items-center focus:outline-none dark:text-text-dark text-text-light"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="User Avatar"
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <UserCircle size={30} strokeWidth={2}/>
                )}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 max-w-80 bg-surface-light dark:bg-surface rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {user?.email && (
                      <div className="px-4 py-2 font-semibold text-sm text-text-light dark:text-text-dark border-b border-gray-200 dark:border-gray-700 overflow-auto">
                        {user.email}
                      </div>
                    )}
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-primary-light/5 md:hidden"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-primary-light/5"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;