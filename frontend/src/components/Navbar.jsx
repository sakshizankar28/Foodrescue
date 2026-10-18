// Navbar.jsx - Top navigation bar with role-based navigation and responsive mobile menu
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../services/api';
import Logo from './Logo';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem('user') || 'null');
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Keep user in sync if login, register, or profile edit updates localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem('user') || 'null'));
    };
    window.addEventListener('storage', handleStorageChange);
    // Also re-check whenever location changes
    handleStorageChange();
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location]);

  // Logout clears session and redirects to homepage
  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => (location.pathname === path ? 'nav-link active' : 'nav-link');

  // How It Works handler: smooth scroll if on homepage, or navigate to /#how-it-works
  const handleHowItWorksClick = (e) => {
    setMenuOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      const elem = document.getElementById('how-it-works');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ height: '100%' }}>
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="nav-links">
            {/* ── Public / Guest Links (when NOT logged in) ── */}
            {!user && (
              <>
                <Link to="/" className={isActive('/')}>Home</Link>
                <Link to="/food" className={isActive('/food')}>Find Food</Link>
                <Link
                  to="/#how-it-works"
                  className="nav-link"
                  onClick={handleHowItWorksClick}
                >
                  How It Works
                </Link>
                <Link to="/about" className={isActive('/about')}>About Us</Link>
                <Link to="/contact" className={isActive('/contact')}>Contact Us</Link>
              </>
            )}

            {/* ── Donor Links (when logged in as donor) ── */}
            {user?.role === 'donor' && (
              <>
                <Link to="/donor-dashboard" className={isActive('/donor-dashboard')}>
                  Dashboard
                </Link>
                <Link to="/add-food" className={isActive('/add-food')}>
                  Donate Food
                </Link>
                <Link to="/profile" className={isActive('/profile')}>
                  Profile
                </Link>
              </>
            )}

            {/* ── NGO Links (when logged in as NGO) ── */}
            {user?.role === 'ngo' && (
              <>
                <Link to="/ngo-dashboard" className={isActive('/ngo-dashboard')}>
                  Dashboard
                </Link>
                <Link to="/food" className={isActive('/food')}>
                  Find Food
                </Link>
                <Link to="/my-requests" className={isActive('/my-requests')}>
                  My Requests
                </Link>
                <Link to="/profile" className={isActive('/profile')}>
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="nav-actions">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link
                  to="/profile"
                  className="nav-user-pill"
                  title="View Profile"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="nav-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
                  <span className="nav-user-name">{user.name}</span>
                  <span className="nav-role-tag">{user.role}</span>
                </Link>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleLogout}
                  title="Logout and return home"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className={`hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Responsive Mobile Navigation Drawer */}
        <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
          {/* Guest Mobile Links */}
          {!user && (
            <>
              <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
                🏠 Home
              </Link>
              <Link to="/food" className="nav-link" onClick={() => setMenuOpen(false)}>
                🍱 Find Food
              </Link>
              <Link
                to="/#how-it-works"
                className="nav-link"
                onClick={handleHowItWorksClick}
              >
                ⚙️ How It Works
              </Link>
              <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>
                ℹ️ About Us
              </Link>
              <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>
                📬 Contact Us
              </Link>

              <div className="mobile-nav-divider" />

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <Link to="/login" className="btn btn-ghost btn-sm btn-full" onClick={() => setMenuOpen(false)}>
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm btn-full" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </div>
            </>
          )}

          {/* Donor Mobile Links */}
          {user?.role === 'donor' && (
            <>
              <Link to="/donor-dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
                📊 Dashboard
              </Link>
              <Link to="/add-food" className="nav-link" onClick={() => setMenuOpen(false)}>
                ➕ Donate Food
              </Link>
              <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                👤 Profile
              </Link>

              <div className="mobile-nav-divider" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="nav-user-pill" style={{ justifyContent: 'center' }}>
                  <div className="nav-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
                  <span className="nav-user-name">{user.name}</span>
                  <span className="nav-role-tag">{user.role}</span>
                </div>
                <button type="button" className="btn btn-outline btn-sm btn-full" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          )}

          {/* NGO Mobile Links */}
          {user?.role === 'ngo' && (
            <>
              <Link to="/ngo-dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
                📊 Dashboard
              </Link>
              <Link to="/food" className="nav-link" onClick={() => setMenuOpen(false)}>
                🍱 Find Food
              </Link>
              <Link to="/my-requests" className="nav-link" onClick={() => setMenuOpen(false)}>
                📋 My Requests
              </Link>
              <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                👤 Profile
              </Link>

              <div className="mobile-nav-divider" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="nav-user-pill" style={{ justifyContent: 'center' }}>
                  <div className="nav-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
                  <span className="nav-user-name">{user.name}</span>
                  <span className="nav-role-tag">{user.role}</span>
                </div>
                <button type="button" className="btn btn-outline btn-sm btn-full" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
