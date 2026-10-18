// MyRequests.jsx - NGO's request history, pickup coordination, and status tracking page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyRequests, updateRequestStatus } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchRequests = async () => {
    try {
      const res = await getMyRequests();
      setRequests(res.data || []);
    } catch (err) {
      console.error('MyRequests fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load requests from MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (requestId, status) => {
    setError('');
    try {
      await updateRequestStatus(requestId, status);
      setMessage(`✅ Request marked as ${status}!`);
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Failed to update status to ${status}.`);
    }
    setTimeout(() => setMessage(''), 4000);
  };

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    collected: requests.filter((r) => r.status === 'collected').length,
    completed: requests.filter((r) => r.status === 'completed').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="page-body">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
          <p style={{ color: 'var(--n-500)', fontWeight: 500 }}>Loading your requests from MySQL…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div className="section-eyebrow">NGO Portal</div>
            <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
              📋 My Food Requests
            </h1>
            <p className="section-sub">
              Monitor response status, pickup coordination addresses, and contact numbers for your requested food donations.
            </p>
          </div>

          <Link to="/ngo-dashboard" className="btn btn-primary">
            🔍 Browse Available Food
          </Link>
        </div>

        {/* Alerts */}
        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
        {message && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{message}</div>}

        {/* Filter Tabs */}
        <div className="req-filter-tabs">
          <button
            type="button"
            className={`req-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            className={`req-filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({counts.pending})
          </button>
          <button
            type="button"
            className={`req-filter-btn ${filter === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilter('accepted')}
          >
            Approved ({counts.accepted})
          </button>
          <button
            type="button"
            className={`req-filter-btn ${filter === 'collected' ? 'active' : ''}`}
            onClick={() => setFilter('collected')}
          >
            Collected ({counts.collected})
          </button>
          <button
            type="button"
            className={`req-filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({counts.completed})
          </button>
          <button
            type="button"
            className={`req-filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({counts.rejected})
          </button>
        </div>

        {/* Request Cards List */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No {filter !== 'all' ? filter : ''} requests found</h3>
            <p>
              {filter === 'all'
                ? 'You have not submitted any food pickup requests yet.'
                : `There are currently no requests in "${filter}" status.`}
            </p>
            <Link to="/ngo-dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Find Food to Request
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filtered.map((req) => (
              <div key={req.id} className="req-card">
                <div className="req-card-icon">
                  {req.status === 'accepted'
                    ? '✅'
                    : req.status === 'collected'
                    ? '📦'
                    : req.status === 'completed'
                    ? '🎉'
                    : req.status === 'rejected'
                    ? '❌'
                    : '⏳'}
                </div>

                <div className="req-card-body">
                  <div className="req-card-title">
                    <h4>{req.food_title || req.food_name}</h4>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="req-card-meta">
                    <span>🏢 <strong>Donor:</strong> {req.donor_name}</span>
                    {req.donor_phone && <span>📞 <strong>Contact:</strong> {req.donor_phone}</span>}
                    <span>📦 <strong>Requested Qty:</strong> {req.requested_quantity || req.quantity}</span>
                    {req.pickup_address && <span>📍 <strong>Pickup:</strong> {req.pickup_address}</span>}
                    {(req.expiry_date || req.available_until) && (
                      <span>
                        ⏳ <strong>Deadline:</strong>{' '}
                        {new Date(req.expiry_date || req.available_until).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  {req.storage_details && (
                    <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--n-600)' }}>
                      ❄️ <strong>Storage:</strong> {req.storage_details}
                    </div>
                  )}

                  {req.message && (
                    <div className="req-card-msg">
                      <strong>Your note:</strong> &ldquo;{req.message}&rdquo;
                    </div>
                  )}

                  {/* Pickup Coordination & Lifecycle Action Buttons */}
                  {req.status === 'accepted' && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.85rem 1rem',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#15803d' }}>🤝 Request Approved!</strong>
                        <div style={{ fontSize: '0.85rem', color: '#166534' }}>
                          Please call the donor at <strong>{req.donor_phone || 'provided contact'}</strong> to coordinate pickup.
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStatusChange(req.id, 'collected')}
                      >
                        📦 Confirm Pickup / Mark Collected
                      </button>
                    </div>
                  )}

                  {req.status === 'collected' && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.85rem 1rem',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#1d4ed8' }}>📦 Food Collected</strong>
                        <div style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                          Food safely collected from donor. Mark completed once distributed to beneficiaries.
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStatusChange(req.id, 'completed')}
                      >
                        🎉 Mark Completed
                      </button>
                    </div>
                  )}

                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--n-400)' }}>
                    Requested on: {req.created_at || req.request_date ? new Date(req.created_at || req.request_date).toLocaleString('en-IN') : 'Recently'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
