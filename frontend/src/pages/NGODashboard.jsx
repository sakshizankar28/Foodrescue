// NGODashboard.jsx - Dashboard & Food Discovery for NGOs
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllFood, getMyRequests } from '../services/api';
import FoodCard from '../components/FoodCard';
import RequestModal from '../components/RequestModal';

const NGODashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{"name":"NGO Partner"}');
  const [foods, setFoods] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [message, setMessage] = useState('');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('all');

  const loadData = async () => {
    try {
      const [foodRes, reqRes] = await Promise.all([
        getAllFood(),
        localStorage.getItem('token') ? getMyRequests().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);
      const availableListings = (foodRes.data || []).filter((f) => f.status === 'available');
      setFoods(availableListings);
      setMyRequests(reqRes.data || []);
    } catch (err) {
      console.error('Failed to load NGO dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Unable to load food listings from MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestClick = (foodItem) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.role === 'donor') {
      setError('Notice: You are currently signed in as a Food Donor. Only registered NGOs can claim food listings. Please log in with an NGO account to request food.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSelectedFood(foodItem);
  };

  const handleRequestSent = (successMsg) => {
    setSelectedFood(null);
    setMessage(successMsg);
    // Reload live requests & food list from backend
    loadData();
    setTimeout(() => setMessage(''), 4000);
  };

  // Filter listings
  const filteredFoods = foods.filter((f) => {
    const title = (f.title || f.food_name || '').toLowerCase();
    const address = (f.pickup_address || '').toLowerCase();
    const donor = (f.donor_name || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchSearch = title.includes(query) || address.includes(query) || donor.includes(query);
    const matchDiet = dietFilter === 'all' || f.food_type === dietFilter;
    return matchSearch && matchDiet;
  });

  const stats = {
    available: foods.length,
    myRequests: myRequests.length,
    accepted: myRequests.filter((r) => r.status === 'accepted').length,
    pending: myRequests.filter((r) => r.status === 'pending').length,
  };

  if (loading) {
    return (
      <div className="page-body">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
          <p style={{ color: 'var(--n-500)', fontWeight: 500 }}>Loading available donations from MySQL…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div className="container">
        {/* Welcome Banner */}
        <div className="dash-welcome">
          <div className="dash-welcome-text">
            <h2>Welcome, {user.name}! 🤝</h2>
            <p>
              🏢 {user.organization || user.name} · Claim and redistribute surplus meals
            </p>
          </div>
          <div className="dash-welcome-emoji">🚚</div>
        </div>

        {/* Alerts */}
        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
        {message && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{message}</div>}

        {/* Stats Row */}
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>🍱</div>
            <div>
              <div className="stat-num" style={{ color: 'var(--success)' }}>{stats.available}</div>
              <div className="stat-label">Available Listings</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--g-100)', color: 'var(--g-700)' }}>📋</div>
            <div>
              <div className="stat-num">{stats.myRequests}</div>
              <div className="stat-label">My Total Requests</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>✅</div>
            <div>
              <div className="stat-num" style={{ color: 'var(--info)' }}>{stats.accepted}</div>
              <div className="stat-label">Approved Pickups</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>⏳</div>
            <div>
              <div className="stat-num" style={{ color: 'var(--warning)' }}>{stats.pending}</div>
              <div className="stat-label">Pending Approval</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="dash-section-head">
            <h3 className="dash-section-title">
              <span>🍱</span> Available Food Ready for Pickup
            </h3>
            <span style={{ fontSize: '0.9rem', color: 'var(--n-500)', fontWeight: 600 }}>
              Showing {filteredFoods.length} of {foods.length} batches
            </span>
          </div>

          <div className="browse-filters">
            {/* Search Box */}
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search food title, donor, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--n-400)' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dietary Type Filter */}
            <select
              className="filter-select"
              value={dietFilter}
              onChange={(e) => setDietFilter(e.target.value)}
            >
              <option value="all">All Dietary Types</option>
              <option value="veg">Vegetarian Only</option>
              <option value="non-veg">Non-Vegetarian</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredFoods.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>No available food listings right now</h3>
            <p>Check back shortly as donors upload surplus food throughout the day.</p>
          </div>
        ) : (
          <div className="grid-cards">
            {filteredFoods.map((f) => (
              <FoodCard
                key={f.id}
                food={f}
                showRequestBtn={true}
                onRequest={handleRequestClick}
              />
            ))}
          </div>
        )}

        {/* Modal for Requesting Food */}
        {selectedFood && (
          <RequestModal
            food={selectedFood}
            onClose={() => setSelectedFood(null)}
            onSuccess={handleRequestSent}
          />
        )}
      </div>
    </div>
  );
};

export default NGODashboard;
