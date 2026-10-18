// Profile.jsx - Basic user profile display and frontend edit form
import { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';

const Profile = () => {
  // Read current user from localStorage
  const [user, setUser] = useState(() => {
    return JSON.parse(
      localStorage.getItem('user') ||
        '{"name":"Campus Coordinator","email":"user@foodrescue.org","role":"donor","phone":"+91 98765 43210","organization":"BITS Hostel Mess","address":"Block B, Campus Mess, Bengaluru"}'
    );
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    organization: user.organization || '',
    address: user.address || '',
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      organization: user.organization || '',
      address: user.address || '',
    });
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      name: formData.name,
      phone: formData.phone,
      organization: formData.organization,
      address: formData.address,
    };

    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    setMessage('✅ Profile details updated successfully!');

    // Trigger window event so Navbar updates if the name changed
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => setMessage(''), 4000);
  };

  const roleLabel = user.role === 'donor' ? 'Food Donor (Hostel/Canteen/Business)' : 'NGO / Community Receiver';

  return (
    <div className="page-body">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="section-eyebrow">User Account</div>
          <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
            👤 My Profile
          </h1>
          <p className="section-sub">
            Manage your account credentials, organization affiliation, and pickup coordination details.
          </p>
        </div>

        {message && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{message}</div>}

        {/* Profile Card */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-body">
            {/* Top User Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid var(--n-200)',
                paddingBottom: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--g-500), var(--g-700))',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--n-900)', marginBottom: '0.2rem' }}>
                    {user.name || 'FoodRescue Member'}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--n-500)' }}>{user.email}</span>
                    <span className="badge badge-both" style={{ textTransform: 'capitalize' }}>
                      {user.role || 'Member'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`btn btn-sm ${isEditing ? 'btn-ghost' : 'btn-outline'}`}
                onClick={() => {
                  setIsEditing(!isEditing);
                  setMessage('');
                }}
              >
                {isEditing ? '✕ Cancel Editing' : '✏️ Edit Profile'}
              </button>
            </div>

            {/* Profile Content View / Edit Mode */}
            {!isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-row">
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--n-400)', textTransform: 'uppercase' }}>
                      Account Role
                    </label>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--g-800)', marginTop: '0.25rem' }}>
                      {roleLabel}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--n-400)', textTransform: 'uppercase' }}>
                      Phone Contact
                    </label>
                    <div style={{ fontSize: '1rem', color: 'var(--n-800)', marginTop: '0.25rem' }}>
                      {user.phone || 'Not provided'}
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--n-400)', textTransform: 'uppercase' }}>
                      Organization / Campus Affiliation
                    </label>
                    <div style={{ fontSize: '1rem', color: 'var(--n-800)', marginTop: '0.25rem' }}>
                      {user.organization || 'Independent'}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--n-400)', textTransform: 'uppercase' }}>
                      Default Pickup Address
                    </label>
                    <div style={{ fontSize: '1rem', color: 'var(--n-800)', marginTop: '0.25rem' }}>
                      {user.address || 'Not specified'}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--g-50)',
                    padding: '1rem',
                    borderRadius: 'var(--r-md)',
                    marginTop: '0.5rem',
                    border: '1px solid var(--g-200)',
                    fontSize: '0.85rem',
                    color: 'var(--g-800)',
                  }}
                >
                  🌱 <strong>Safe Community Member:</strong> Your contact details are shared with verified donors and NGOs only when a food donation pickup is confirmed.
                </div>
              </div>
            ) : (
              /* Edit Profile Form */
              <form onSubmit={handleSave}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--n-800)' }}>
                  Edit Profile Information
                </h3>

                <div className="form-row" style={{ marginBottom: '1.2rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-name">Full Name *</label>
                    <input
                      type="text"
                      id="prof-name"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-phone">Phone Number</label>
                    <input
                      type="tel"
                      id="prof-phone"
                      name="phone"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                  <label className="form-label" htmlFor="prof-email">Email Address</label>
                  <input
                    type="email"
                    id="prof-email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    disabled
                    title="Email cannot be changed directly"
                  />
                  <span className="form-hint">Email address is tied to your account login.</span>
                </div>

                <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                  <label className="form-label" htmlFor="prof-org">Organization / Institution Name</label>
                  <input
                    type="text"
                    id="prof-org"
                    name="organization"
                    className="form-control"
                    placeholder="e.g. BITS Pilani Hostel Mess / Asha NGO"
                    value={formData.organization}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" htmlFor="prof-address">Primary Address / Campus Location</label>
                  <textarea
                    id="prof-address"
                    name="address"
                    className="form-control"
                    rows={2}
                    placeholder="e.g. Block B, Campus Mess, Electronic City, Bengaluru"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    💾 Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
