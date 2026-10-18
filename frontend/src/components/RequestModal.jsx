// RequestModal.jsx - Reusable modal for NGOs to send a food request to a donor
import { useState } from 'react';
import { createRequest } from '../services/api';

const RequestModal = ({ food, onClose, onSuccess }) => {
  const defaultQty = food.available_quantity !== undefined && food.available_quantity !== null
    ? `${food.available_quantity} servings`
    : food.quantity;
  const [requestedQuantity, setRequestedQuantity] = useState(defaultQty);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createRequest({
        food_id: food.id,
        requested_quantity: requestedQuantity || food.quantity,
        message: message ? message.trim() : undefined,
      });
      onSuccess(`✅ Request submitted successfully for "${food.title || food.food_name}"! Saved to MySQL.`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit food request. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 className="modal-title">🙏 Request Food Donation</h3>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--n-400)' }}
          >
            ✕
          </button>
        </div>

        <p className="modal-sub">
          You are requesting: <strong style={{ color: 'var(--n-800)' }}>{food.title}</strong> ({food.quantity}) from <strong style={{ color: 'var(--g-700)' }}>{food.organization || food.donor_name}</strong>.
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" htmlFor="req-qty">
              Requested Quantity / Servings *
            </label>
            <input
              type="text"
              id="req-qty"
              className="form-control"
              placeholder="e.g. 20 servings, 30 packets"
              value={requestedQuantity}
              onChange={(e) => setRequestedQuantity(e.target.value)}
              required
            />
            <span className="form-hint">
              Total available: {food.available_quantity !== undefined && food.available_quantity !== null ? `${food.available_quantity} servings` : food.quantity}
            </span>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="req-message">
              Message to Donor & Pickup Plan (Optional)
            </label>
            <textarea
              id="req-message"
              className="form-control"
              rows={4}
              placeholder="e.g. We are an NGO running a community shelter nearby. We can pick this up today at 6 PM to feed 30 people."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Sending…' : '🚀 Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;
