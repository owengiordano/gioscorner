import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/menu', label: 'Menu' },
    { path: '/catering-menu', label: 'Catering Menu' },
    { path: '/how-to-order', label: 'How to Order' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-3xl text-primary-600" style={{ fontFamily: "'Grand Hotel', cursive" }}>Gio's Corner</span>
          </Link>

          {/* Navigation Links */}
          {!isAdmin && (
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

        </div>

        {/* Mobile Navigation */}
        {!isAdmin && (
          <div className="md:hidden pb-4 flex items-center justify-center gap-0">
            {navLinks.map((link, index) => (
              <div key={link.path} className="flex items-center">
                <Link
                  to={link.path}
                  className={`text-sm font-medium px-4 py-2 ${
                    location.pathname === link.path
                      ? 'text-primary-600'
                      : 'text-gray-600'
                  }`}
                >
                  {link.label}
                </Link>
                {index < navLinks.length - 1 && (
                  <span className="text-gray-300 text-lg">|</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

