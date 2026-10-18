// Home.jsx - Modern, high-impact landing page for FoodRescue
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FoodCard from '../components/FoodCard';
import { getAllFood } from '../services/api';
import heroImg from '../assets/hero.jpg';

// Featured foods for the landing page showcase
const FEATURED_FOODS = [
  {
    id: 1,
    title: 'Dal Rice & Sabzi (Hostel Mess)',
    description: 'Freshly prepared evening batch from BITS Hostel Mess. Packed hygienically in covered stainless steel containers.',
    quantity: '35 servings',
    food_type: 'veg',
    expiry_date: '2026-10-13',
    pickup_address: 'Block B Hostel Mess, BITS Campus, Bengaluru',
    status: 'available',
    donor_name: 'BITS Hostel Mess',
    donor_phone: '+91 98765 43210',
    organization: 'BITS Hostel Mess',
  },
  {
    id: 2,
    title: 'Fresh Rotis & Mixed Veg Curry',
    description: 'Surplus rotis and vegetable curry from university canteen lunch service. Packaged in food-grade foil containers.',
    quantity: '40 servings',
    food_type: 'veg',
    expiry_date: '2026-10-13',
    pickup_address: 'Main Campus Canteen, RV College, Bengaluru',
    status: 'available',
    donor_name: 'RV College Canteen',
    donor_phone: '+91 91234 56789',
    organization: 'RV College Canteen',
  },
  {
    id: 3,
    title: 'Chicken Biryani & Raita (Banquet Surplus)',
    description: 'Unserved wedding banquet surplus food. Stored safely at optimum temperature in large commercial food containers.',
    quantity: '50 servings',
    food_type: 'non-veg',
    expiry_date: '2026-10-13',
    pickup_address: 'Shree Kalyana Mantapa, MG Road, Bengaluru',
    status: 'available',
    donor_name: 'Shree Caterers',
    donor_phone: '+91 99887 76655',
    organization: 'Shree Caterers',
  },
  {
    id: 4,
    title: 'Vegetable Pulao & Dal Tadka',
    description: 'Corporate cafeteria surplus from tech park lunch buffet. Wholesome nutrition, sealed and ready for direct distribution.',
    quantity: '30 servings',
    food_type: 'veg',
    expiry_date: '2026-10-13',
    pickup_address: 'Infosys Cafeteria, Electronics City, Bengaluru',
    status: 'available',
    donor_name: 'Infosys Cafeteria',
    donor_phone: '+91 90012 34567',
    organization: 'Infosys Food Services',
  },
];

const stats = [
  { num: '5,000+', label: 'Meals Saved', icon: '🍲' },
  { num: '45+',    label: 'Hostel & Canteens', icon: '🏫' },
  { num: '30+',    label: 'Partner NGOs', icon: '🤝' },
  { num: '0 ₹',    label: 'Cost to Shelters', icon: '💚' },
];

const steps = [
  {
    num: '01',
    title: 'Donor Posts Surplus',
    desc: 'Hostels, caterers, or canteens upload excess prepared food details with photo, quantity, and safe pickup window.',
    icon: '🍱',
  },
  {
    num: '02',
    title: 'NGOs Receive Alert',
    desc: 'Nearby verified NGOs and community kitchens browse real-time listings on their live discovery dashboard.',
    icon: '🔔',
  },
  {
    num: '03',
    title: '1-Click Claim Request',
    desc: 'The NGO submits a claim request with pickup logistics. Donor receives instant notification for approval.',
    icon: '🤝',
  },
  {
    num: '04',
    title: 'Hygienic Distribution',
    desc: 'Volunteers pick up insulated containers and distribute fresh meals to nearby shelters, orphanages, and slums.',
    icon: '🚚',
  },
];

const categories = [
  { name: 'College Hostel Messes', desc: 'Nightly surplus dal, rice, rotis, and curries packed hygienically.', count: '18 Donors', icon: '🏫' },
  { name: 'University Canteens',    desc: 'Lunch buffet excess, packaged snacks, and cooked meal boxes.', count: '14 Donors', icon: '☕' },
  { name: 'Wedding Caterers',      desc: 'High-volume banquet curries, pulao, and sweets stored at temperature.', count: '12 Donors', icon: '🎉' },
  { name: 'Corporate Cafeterias',  desc: 'Fresh corporate lunch buffet surplus sealed in food-grade trays.', count: '9 Donors', icon: '🏢' },
];

const Home = () => {
  const location = useLocation();
  const [liveFoods, setLiveFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real food listings from MySQL
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await getAllFood();
        const available = (res.data || []).filter((f) => f.status === 'available');
        setLiveFoods(available.slice(0, 4));
      } catch (err) {
        console.error('Error fetching live food listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  // Smooth scroll to anchor hash
  useEffect(() => {
    if (location.hash) {
      const elem = document.querySelector(location.hash);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div>
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <img src={heroImg} alt="Food rescue community distribution" />
          <div className="hero-overlay" />
        </div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span>🌱 Verified Food Redistribution Network</span>
            </div>

            <h1 className="hero-heading">
              Zero Food Waste.{' '}
              <span className="accent">Zero Empty Stomachs.</span>
            </h1>

            <p className="hero-sub">
              FoodRescue connects surplus food from college hostels, canteens, restaurants, and caterers
              directly with nearby NGOs to feed communities in need.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                🍱 Donate Food Today
              </Link>
              <Link to="/food" className="btn btn-outline-white btn-lg">
                🔍 Find Food Near Me
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num">5,000+</div>
                <div className="hero-stat-lbl">Meals Redistributed</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">45+</div>
                <div className="hero-stat-lbl">Active Campus Canteens</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">30+</div>
                <div className="hero-stat-lbl">Verified NGO Partners</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Ribbon ────────────────────────────────────────── */}
      <div className="stats-ribbon">
        <div className="container">
          <div className="stats-ribbon-inner">
            {stats.map((s, idx) => (
              <div key={idx} className="ribbon-stat">
                <div className="num">{s.num}</div>
                <div className="lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured Food Listings Section ──────────────────────── */}
      <section id="available-food" className="section" style={{ background: 'var(--c-50)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
            <div>
              <div className="section-eyebrow">🍱 Fresh Surplus Available Now</div>
              <h2 className="section-title">Urgent Food Donations Ready for Pickup</h2>
              <p className="section-sub">
                Inspected and packaged meal batches from campus canteens and verified donors waiting for NGO collection.
              </p>
            </div>
            <Link to="/food" className="btn btn-outline">
              View All Listings →
            </Link>
          </div>

          <div className="grid-cards">
            {(liveFoods.length > 0 ? liveFoods : FEATURED_FOODS).map((food) => (
              <FoodCard key={food.id} food={food} showRequestBtn={false} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────── */}
      <section id="how-it-works" className="section how-works">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
            <div className="section-eyebrow">Simple Workflow</div>
            <h2 className="section-title">How FoodRescue Works</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>
              From surplus kitchen prep to feeding hungry stomachs in four transparent steps.
            </p>
          </div>

          <div className="step-grid">
            {steps.map((st) => (
              <div key={st.num} className="step-card">
                <div className="step-num-badge">{st.num}</div>
                <div className="step-icon-big">{st.icon}</div>
                <h3 className="step-title">{st.title}</h3>
                <p className="step-desc">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Donor Sectors ───────────────────────────────────────── */}
      <section className="section donor-types">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
            <div className="section-eyebrow">Who Can Donate?</div>
            <h2 className="section-title">Partnering Across Institutions</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>
              Any organized kitchen preparing wholesome meals in bulk can register and list excess food in under 2 minutes.
            </p>
          </div>

          <div className="grid-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="category-card">
                <div className="category-icon">{cat.icon}</div>
                <h4 className="category-title">{cat.name}</h4>
                <p className="category-desc">{cat.desc}</p>
                <div className="category-badge">{cat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission Callout Banner ──────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-block">
            <h2>Ready to Turn Waste Into Smiles? 🍛</h2>
            <p>
              Whether you manage a college canteen with 30 surplus dinner plates or an NGO van ready for distribution,
              your involvement saves lives every evening.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started for Free
              </Link>
              <Link to="/about" className="btn btn-outline btn-lg">
                Read Our Mission →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
