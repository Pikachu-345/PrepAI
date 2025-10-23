import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login'); 
    setIsOpen(false); 
  };

  const guestLinks = (
    <>
      <Link
        to="/login"
        className="px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
        onClick={() => setIsOpen(false)}
      >
        Login
      </Link>
      <Link
        to="/signup"
        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        onClick={() => setIsOpen(false)}
      >
        Sign Up
      </Link>
    </>
  );

  // Links to show when the user is logged IN
  const authLinks = (
    <>
      <Link
        to="/upload"
        className="px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
        onClick={() => setIsOpen(false)}
      >
        Uploads
      </Link>
      <Link
        to="/chat"
        className="px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
        onClick={() => setIsOpen(false)}
      >
        Chat
      </Link>
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Logout
      </button>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand/Logo */}
          <div className="shrink-0">
            <Link to="/" className="text-2xl font-bold text-white">
              PrepAI
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {token ? authLinks : guestLinks}
            </div>
          </div>

          {/* Hamburger Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                // Hamburger Icon
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                // Close Icon
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {token ? (
              <div className="flex flex-col space-y-1">
                {authLinks}
              </div>
            ) : (
              <div className="flex flex-col space-y-1">
                {guestLinks}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
