// About.jsx - Simple, inspiring About Us page explaining FoodRescue's mission
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="page-body">
      <div className="container">
        {/* Page Hero Header */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '1rem auto 3rem' }}>
          <div className="section-eyebrow">🌱 Our Purpose & Mission</div>
          <h1 className="section-title">Bridging Surplus Food with Hunger</h1>
          <p className="section-sub" style={{ margin: '0 auto', fontSize: '1.1rem' }}>
            FoodRescue was founded on a simple conviction: <strong>Good food prepared with care should nourish people, never landfills.</strong>
          </p>
        </div>

        {/* Mission & Problem Section */}
        <div className="grid-2" style={{ marginBottom: '3.5rem', alignItems: 'stretch' }}>
          <div className="card" style={{ height: '100%' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '2.5rem' }}>📉</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>The Problem We Address</h3>
              <p style={{ color: 'var(--n-600)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Every single day, college hostels, campus canteens, wedding caterers, and hotels produce substantial amounts of clean, untouched surplus food that ends up discarded purely due to lack of immediate local coordination.
              </p>
              <p style={{ color: 'var(--n-600)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                At the same time, shelters, orphanages, and community food banks struggle with daily operational expenses to provide wholesome meals for those they care for.
              </p>
            </div>
          </div>

          <div className="card" style={{ height: '100%', background: 'linear-gradient(145deg, var(--g-50), var(--white))', border: '1.5px solid var(--g-200)' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '2.5rem' }}>🤝</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Our Technology Solution</h3>
              <p style={{ color: 'var(--n-600)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                FoodRescue serves as a direct, instant bridge between verified bulk food donors and registered NGOs. 
              </p>
              <p style={{ color: 'var(--n-600)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Donors post surplus batches in under 60 seconds with quantity, expiry deadlines, and pickup locations. Nearby NGOs receive instant alerts, request matches, and collect the food promptly.
              </p>
            </div>
          </div>
        </div>

        {/* Core Principles */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="section-eyebrow">Our Guiding Values</div>
            <h2 className="section-title">The Pillars of FoodRescue</h2>
          </div>

          <div className="grid-3">
            <div className="card">
              <div className="card-body">
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>🛡️</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Safety & Freshness First</h4>
                <p style={{ color: 'var(--n-500)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Strict time-to-consume windows ensure only freshly prepared, hygienically stored food is redistributed.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>⚡</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Zero Red Tape</h4>
                <p style={{ color: 'var(--n-500)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Direct coordinator-to-driver handoffs without complicated intermediary barriers or delays.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>🌍</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Environmental Care</h4>
                <p style={{ color: 'var(--n-500)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Preventing organic waste from dumping sites drastically lowers greenhouse methane emissions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call To Action Box */}
        <div className="cta-block" style={{ marginBottom: '2rem' }}>
          <h2>Be Part of the Zero Hunger Movement</h2>
          <p>
            Join campus canteens, catering companies, and dedicated volunteer networks making a tangible local difference every day.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              🌱 Register as Donor
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg">
              🤝 Register as NGO
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
