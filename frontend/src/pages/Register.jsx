// Register.jsx - User registration page with interactive role selector
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import Logo from '../components/Logo';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('donor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    organization: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await registerUser({ ...formData, role });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'donor') {
        navigate('/donor-dashboard');
      } else {
        navigate('/ngo-dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed. Please check your details.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-wrap">
          {/* Left Decorative Feature Panel */}
          <div className="auth-side">
            <div className="auth-side-content">
              <div style={{ marginBottom: '1.5rem' }}>
                <Logo variant="light" />
              </div>
              <h2>Join the Fight Against Food Waste.</h2>
              <p>
                Whether you have surplus nutritious meals to give or communities to feed, we make the handoff rapid and safe.
              </p>

              <div className="auth-side-feat">
                <div className="auth-feat-item">
                  <div className="auth-feat-icon">🍲</div>
                  <div className="auth-feat-text"><strong>Donors:</strong> Reduce disposal costs, achieve ESG compliance</div>
                </div>
                <div className="auth-feat-item">
                  <div className="auth-feat-icon">🤝</div>
                  <div className="auth-feat-text"><strong>NGOs:</strong> Free source of safe, wholesome food for shelters</div>
                </div>
                <div className="auth-feat-item">
                  <div className="auth-feat-icon">📍</div>
                  <div className="auth-feat-text"><strong>Hyperlocal:</strong> Match with donors within a 5-10 km radius</div>
                </div>
              </div>
            </div>

            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>
              Free to register · Open for all Indian colleges and NGOs
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="auth-form-side">
            <h2 className="auth-form-title">Create Account ✨</h2>
            <p className="auth-form-sub">Choose your account type and fill in your details</p>

            {/* Role Selector Tabs */}
            <div className="role-select">
              <button
                type="button"
                className={`role-btn ${role === 'donor' ? 'selected' : ''}`}
                onClick={() => setRole('donor')}
              >
                <div className="role-emoji">🏪</div>
                <div className="role-name">Food Donor</div>
                <div className="role-desc">Hostel, Canteen, Hotel, Caterer</div>
              </button>

              <button
                type="button"
                className={`role-btn ${role === 'ngo' ? 'selected' : ''}`}
                onClick={() => setRole('ngo')}
              >
                <div className="role-emoji">🤝</div>
                <div className="role-name">NGO / Receiver</div>
                <div className="role-desc">Shelter, Trust, Food Bank</div>
              </button>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="name@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="organization">
                  {role === 'donor' ? 'Hostel / Canteen / Business Name' : 'NGO / Foundation Name'}
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  className="form-control"
                  placeholder={role === 'donor' ? 'e.g. BITS Pilani Hostel Mess' : 'e.g. Asha Foundation'}
                  value={formData.organization}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" htmlFor="address">Address / Campus Location</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="form-control"
                  placeholder="e.g. Hostel Block B, University Campus, Bengaluru"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading ? '⏳ Creating Account…' : `✨ Register as ${role === 'donor' ? 'Donor' : 'NGO'}`}
              </button>
            </form>

            <div className="auth-footer-link">
              Already have an account? <Link to="/login">Sign in here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
