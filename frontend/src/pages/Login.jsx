// Login.jsx - User authentication page with modern split layout
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import Logo from '../components/Logo';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginUser(formData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'donor') {
        navigate('/donor-dashboard');
      } else {
        navigate('/ngo-dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed. Please verify your credentials.';
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
              <h2>Connecting Surplus with Hunger.</h2>
              <p>
                Join hundreds of college hostels, canteens, and caterers feeding nearby orphanages and shelter homes daily.
              </p>

              <div className="auth-side-feat">
                <div className="auth-feat-item">
                  <div className="auth-feat-icon">⚡</div>
                  <div className="auth-feat-text">Instant real-time pickup alerts for local NGOs</div>
                </div>
                <div className="auth-feat-item">
                  <div className="auth-feat-icon">🛡️</div>
                  <div className="auth-feat-text">Verified donor identity and food safety adherence</div>
                </div>
                <div className="auth-feat-item">
                  <div className="auth-feat-icon">📊</div>
                  <div className="auth-feat-text">Transparent impact dashboards tracking meals saved</div>
                </div>
              </div>
            </div>

            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>
              Every meal saved is a step toward zero food waste.
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="auth-form-side">
            <h2 className="auth-form-title">Welcome Back 👋</h2>
            <p className="auth-form-sub">Sign in to your FoodRescue account to continue</p>

            {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="name@organization.org"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading ? '⏳ Signing in…' : '🔑 Sign In to Dashboard'}
              </button>
            </form>

            <div className="auth-footer-link">
              Don't have an account yet? <Link to="/register">Register here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
