// Footer.jsx - Site-wide footer with branding, links, and contact details
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div>
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <Logo size="sm" variant="light" />
            </div>
            <p className="footer-desc">
              Bridging the gap between food donors and communities in need. Safe, prompt, and transparent surplus food redistribution.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-col-title">Platform</h4>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/food">Browse Food Listings</Link>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact Us</Link>
              <Link to="/register">Join the Network</Link>
            </div>
          </div>

          {/* Partners */}
          <div>
            <h4 className="footer-col-title">Donors We Support</h4>
            <div className="footer-links">
              <span>College & Hostel Canteens</span>
              <span>Hotels & Restaurants</span>
              <span>Wedding & Event Caterers</span>
              <span>Corporate Cafeterias</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-col-title">Get in Touch</h4>
            <div className="footer-links">
              <a href="mailto:support@foodrescue.org">📧 support@foodrescue.org</a>
              <a href="tel:+919876543210">📞 +91 98765 43210</a>
              <span>📍 Bengaluru, Karnataka, India</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} FoodRescue Platform. Safe Food Redistribution Initiative.</span>
          <span>
            Crafted with <span className="footer-heart">❤️</span> to fight hunger and eliminate surplus food waste.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
