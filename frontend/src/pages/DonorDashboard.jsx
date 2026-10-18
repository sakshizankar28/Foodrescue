// DonorDashboard.jsx - Dashboard for food donors (Hostels, Canteens, Caterers)
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyFood, getIncomingRequests, updateRequestStatus, deleteFood } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const DonorDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Donor"}');
  const [myFood, setMyFood] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadDashboardData = async () => {
    try {
      const [foodRes, reqRes] = await Promise.all([getMyFood(), getIncomingRequests()]);
      setMyFood(foodRes.data || []);
      setRequests(reqRes.data || []);
    } catch (err) {
      console.error('Failed to load donor dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRequestAction = async (requestId, status) => {
    setError('');
    try {
      await updateRequestStatus(requestId, status);
      // Backend confirmed successfully
      setMessage(`✅ Request has been marked as ${status}!`);
      // Reload dashboard so listing status and request status update simultaneously
      await loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Failed to update request to ${status}.`);
    }
    setTimeout(() => setMessage(''), 4000);
  };

  const handleDelete = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this food listing?')) return;
    setError('');
    try {
      await deleteFood(foodId);
      setMyFood((prev) => prev.filter((f) => f.id !== foodId));
      setMessage('🗑️ Food listing removed successfully.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete food listing.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const stats = {
    total: myFood.length,
    available: myFood.filter((f) => f.status === 'available').length,
    claimed: myFood.filter((f) => f.status === 'claimed').length,
    pending: requests.filter((r) => r.status === 'pending').length,
  };

  if (loading) {
    return (
      <div className="page-body">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
          <p style={{ color: 'var(--n-500)', fontWeight: 500 }}>Loading donor dashboard from MySQL…</p>
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
            <h2>Welcome, {user.name}! 🍱</h2>
            <p>
              🏢 {user.organization || user.name} · Managing surplus food allocations
            </p>
          </div>
          <div className="dash-welcome-emoji">👨‍🍳</div>
        </div>

        {/* Alerts */}
        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
        {message && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{message}</div>}

        {/* Top Metric Cards */}
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--g-100)', color: 'var(--g-700)' }}>📦</div>
            <div>
              <div className="stat-num">{stats.total}</div>
              <div className="stat-label">Total Listings</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>✅</div>
            <div>
              <div className="stat-num" style={{ color: 'var(--success)' }}>{stats.available}</div>
              <div className="stat-label">Available for Pickup</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>🤝</div>
            <div>
              <div className="stat-num" style={{ color: 'var(--info)' }}>{stats.claimed}</div>
              <div className="stat-label">Claimed by NGOs</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>⏳</div>
            <div>
              <div className="stat-num" style={{ color: 'var(--warning)' }}>{stats.pending}</div>
              <div className="stat-label">Pending Requests</div>
            </div>
          </div>
        </div>

        {/* Section: Incoming Requests */}
        <div className="card" style={{ marginBottom: '2.5rem' }}>
          <div className="card-body">
            <div className="dash-section-head">
              <h3 className="dash-section-title">
                <span>📬</span> Incoming Requests from Partner NGOs
              </h3>
              <span className="badge badge-new">{requests.length} Requests</span>
            </div>

            {requests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No incoming requests yet</h3>
                <p>When verified local NGOs request your surplus food, they will appear here for one-click approval.</p>
              </div>
            ) : (
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Food Batch</th>
                      <th>Requesting NGO</th>
                      <th>Message & Logistics</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <strong>{req.food_title || req.food_name}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--n-500)' }}>Qty: {req.requested_quantity || req.quantity}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{req.ngo_name}</div>
                          {req.ngo_phone && <div style={{ fontSize: '0.8rem', color: 'var(--n-500)' }}>📞 {req.ngo_phone}</div>}
                        </td>
                        <td style={{ maxWidth: '300px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--n-600)' }}>
                            {req.message || 'Pickup requested for community distribution.'}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={req.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {req.status === 'pending' && (
                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                              <button
                                type="button"
                                className="btn btn-primary btn-xs"
                                onClick={() => handleRequestAction(req.id, 'accepted')}
                                title="Approve request and reserve quantity"
                              >
                                ✓ Approve
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-xs"
                                onClick={() => handleRequestAction(req.id, 'rejected')}
                                title="Reject request"
                              >
                                ✕ Reject
                              </button>
                            </div>
                          )}

                          {req.status === 'accepted' && (
                            <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-outline btn-xs"
                                style={{ borderColor: 'var(--info)', color: 'var(--info)' }}
                                onClick={() => handleRequestAction(req.id, 'collected')}
                                title="Mark food as collected by NGO"
                              >
                                📦 Mark Collected
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                style={{ color: 'var(--danger)' }}
                                onClick={() => handleRequestAction(req.id, 'rejected')}
                                title="Cancel approval and restore quantity"
                              >
                                ✕ Cancel
                              </button>
                            </div>
                          )}

                          {req.status === 'collected' && (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => handleRequestAction(req.id, 'completed')}
                              title="Complete handover process"
                            >
                              🎉 Complete
                            </button>
                          )}

                          {['completed', 'rejected', 'cancelled'].includes(req.status) && (
                            <span style={{ fontSize: '0.82rem', color: 'var(--n-400)', fontWeight: 600, textTransform: 'capitalize' }}>
                              {req.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Section: My Food Listings */}
        <div className="card">
          <div className="card-body">
            <div className="dash-section-head">
              <h3 className="dash-section-title">
                <span>🍱</span> My Active Food Listings
              </h3>
              <Link to="/add-food" className="btn btn-primary btn-sm">
                ➕ Post New Food Donation
              </Link>
            </div>

            {myFood.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <h3>No food listed currently</h3>
                <p>Have surplus food from today's cooking? List it now to notify nearby NGOs.</p>
                <Link to="/add-food" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  + Add Food Listing
                </Link>
              </div>
            ) : (
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Quantity & Available</th>
                      <th>Prep & Storage</th>
                      <th>Pickup Address</th>
                      <th>Pickup Deadline</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myFood.map((food) => (
                      <tr key={food.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {food.image && (
                              <img
                                src={food.image.startsWith('/uploads') ? `http://localhost:5000${food.image}` : food.image}
                                alt={food.title || food.food_name}
                                style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                              />
                            )}
                            <div>
                              <strong>{food.title || food.food_name}</strong>
                              {food.description && <div style={{ fontSize: '0.8rem', color: 'var(--n-500)' }}>{food.description}</div>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{food.quantity}</strong>
                          {food.available_quantity !== null && food.available_quantity !== undefined && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--g-700)', fontWeight: 600 }}>
                              {food.available_quantity} remaining
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--n-600)' }}>
                          {food.preparation_time && <div>⏱️ {food.preparation_time}</div>}
                          {food.storage_details && <div>❄️ {food.storage_details}</div>}
                        </td>
                        <td style={{ maxWidth: '180px', fontSize: '0.85rem' }}>{food.pickup_address}</td>
                        <td>
                          {food.expiry_date || food.available_until
                            ? new Date(food.expiry_date || food.available_until).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </td>
                        <td>
                          <StatusBadge status={food.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => handleDelete(food.id)}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
