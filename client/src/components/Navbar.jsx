import { useState, useRef,useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Menu, X } from 'lucide-react'; 

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null); 

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false); 
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]); 

  const linkClasses = "block sm:inline-block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out";
  const inactiveLinkClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";
  const buttonClasses = "block sm:inline-block px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out";
  const primaryButtonClasses = `${buttonClasses} text-white bg-blue-600 hover:bg-blue-700 shadow-sm`;
  const secondaryButtonClasses = `${buttonClasses} text-gray-300 hover:bg-gray-700 hover:text-white`;

   const guestLinks = (
    <>
      <Link
        to="/login"
        className={`${secondaryButtonClasses} ${linkClasses} ${inactiveLinkClasses}`}
        onClick={() => setIsOpen(false)}
      >
        Login
      </Link>
      <Link
        to="/signup"
        className={`${primaryButtonClasses}`}
        onClick={() => setIsOpen(false)}
      >
        Sign Up
      </Link>
    </>
  );

  const authLinks = (
    <>
      <Link
        to="/upload"
        className={`${linkClasses} ${inactiveLinkClasses}`}
        onClick={() => setIsOpen(false)}
      >
        Uploads
      </Link>
       <Link
        to="/chats"
        className={`${linkClasses} ${inactiveLinkClasses}`}
        onClick={() => setIsOpen(false)}
      >
        History
      </Link>
      <Link
        to="/chat/new"
        className={`${linkClasses} ${inactiveLinkClasses}`}
        onClick={() => setIsOpen(false)}
      >
        New Chat
      </Link>
      <button
        onClick={handleLogout} 
        className={`${primaryButtonClasses}`}
      >
        Logout
      </button>
    </>
  );

  return (
    <nav ref={navRef} className="sticky top-0 z-50 bg-gray-800 shadow-md">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">

          <div className="shrink-0">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-white hover:text-blue-300 transition-colors duration-200">
              PrepAI
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:justify-center md:flex-1">
             <div className="flex items-baseline space-x-4">
               {token ? authLinks : guestLinks}
             </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)} 
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition duration-150 ease-in-out"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

        </div>
      </div>

      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
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
    </nav>
  );
};

export default Navbar;