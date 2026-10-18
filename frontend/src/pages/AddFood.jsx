// AddFood.jsx - Form page for donors to post new food donations with image upload
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addFood } from '../services/api';

const today = new Date().toISOString().split('T')[0];

const AddFood = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    preparation_time: '',
    storage_details: '',
    quantity: '',
    food_type: 'veg',
    expiry_date: today,
    pickup_address: user.address || '',
  });

  // State for image file and preview
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Handle image file selection with validation (JPG, JPEG, PNG, max 5MB)
  const handleImageChange = (e) => {
    setError('');
    const file = e.target.files && e.target.files[0];

    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const validExtensions = /\.(jpe?g|png)$/i;
    if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
      setError('Invalid file format. Please upload a JPG, JPEG, or PNG image.');
      e.target.value = '';
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    // Validate file size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large! Maximum allowed size is 5MB.');
      e.target.value = '';
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('food_image');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Ensure image is selected
    if (!imageFile) {
      setError('Upload Food Image is required. Please select a photo of the food.');
      setLoading(false);
      return;
    }

    try {
      // Build multipart FormData for uploading file and food details together
      const data = new FormData();
      data.append('title', formData.title);
      data.append('food_name', formData.title);
      data.append('description', formData.description);
      data.append('preparation_time', formData.preparation_time || 'Freshly prepared');
      data.append('storage_details', formData.storage_details || 'Room temperature / Clean containers');
      data.append('quantity', formData.quantity);
      data.append('food_type', formData.food_type);
      data.append('expiry_date', formData.expiry_date);
      data.append('available_until', formData.expiry_date);
      data.append('pickup_address', formData.pickup_address);
      data.append('image', imageFile);

      await addFood(data);
      setSuccess('✅ Food listing with photo published! It is now stored in MySQL and visible on the NGO Dashboard.');
      setTimeout(() => navigate('/donor-dashboard'), 1500);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to post food listing. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/donor-dashboard" className="btn btn-ghost btn-sm">
            ← Back to Donor Dashboard
          </Link>
        </div>

        <div className="add-food-layout">
          <div className="add-food-card">
            {/* Header */}
            <div className="add-food-header">
              <h2>🍱 Post Food Donation</h2>
              <p>
                Provide accurate food quantity, pickup details, and a clear photo of the food so NGOs can coordinate promptly.
              </p>
            </div>

            {/* Form Body */}
            <div className="add-food-body">
              {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}
              {success && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>{success}</div>}

              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" htmlFor="title">
                    Food Name / Items Summary *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    placeholder="e.g. Steamed Rice & Sambar, 50 Chapathis, Vegetable Biryani"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                  <span className="form-hint">Mention the primary food items clearly.</span>
                </div>

                {/* Description */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" htmlFor="description">
                    Preparation & Packaging Details
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    rows={3}
                    placeholder="e.g. Prepared for lunch service at 12:30 PM. Stored in clean stainless steel containers. Please bring clean vessels or bags."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                {/* Upload Food Image (Required) */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" htmlFor="food_image">
                    Upload Food Image * (JPG, JPEG, or PNG, Max 5MB)
                  </label>

                  <div
                    style={{
                      border: '2px dashed var(--g-300, #86efac)',
                      borderRadius: '8px',
                      padding: '1.25rem',
                      background: 'var(--g-50, #f0fdf4)',
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    {!imagePreview ? (
                      <div>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</div>
                        <p style={{ fontWeight: 600, color: 'var(--n-800)', marginBottom: '0.25rem' }}>
                          Select a photo of the food from your device
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--n-500)', marginBottom: '1rem' }}>
                          Accepted formats: JPG, JPEG, PNG (Up to 5MB)
                        </p>
                        <input
                          type="file"
                          id="food_image"
                          name="food_image"
                          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                          onChange={handleImageChange}
                          required
                          style={{
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'inline-block',
                          }}
                        />
                      </div>
                    ) : (
                      <div>
                        <div style={{ marginBottom: '0.75rem' }}>
                          <img
                            src={imagePreview}
                            alt="Food Preview"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '220px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--n-600)', fontWeight: 500 }}>
                            📁 {imageFile?.name} ({(imageFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger, #dc2626)' }}
                            onClick={handleRemoveImage}
                          >
                            ✕ Remove / Change Photo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="form-hint">A clear picture of the food helps NGOs verify readiness and pack distribution bags accordingly.</span>
                </div>

                {/* Quantity and Dietary Type */}
                <div className="form-row" style={{ marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="quantity">
                      Approximate Quantity / Servings *
                    </label>
                    <input
                      type="text"
                      id="quantity"
                      name="quantity"
                      className="form-control"
                      placeholder="e.g. 35 servings, 10 kg, 40 packets"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="food_type">
                      Dietary Classification *
                    </label>
                    <select
                      id="food_type"
                      name="food_type"
                      className="form-control"
                      value={formData.food_type}
                      onChange={handleChange}
                    >
                      <option value="veg">🌿 Pure Vegetarian</option>
                      <option value="non-veg">🍗 Non-Vegetarian</option>
                      <option value="both">🍱 Mixed / Both</option>
                    </select>
                  </div>
                </div>

                {/* Preparation Time & Storage Details */}
                <div className="form-row" style={{ marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="preparation_time">
                      Preparation Time *
                    </label>
                    <input
                      type="text"
                      id="preparation_time"
                      name="preparation_time"
                      className="form-control"
                      placeholder="e.g. Today at 12:30 PM, 1 hour ago"
                      value={formData.preparation_time}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="storage_details">
                      Storage Details / Temperature *
                    </label>
                    <input
                      type="text"
                      id="storage_details"
                      name="storage_details"
                      className="form-control"
                      placeholder="e.g. Refrigerated at 4°C, Covered steel containers"
                      value={formData.storage_details}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" htmlFor="expiry_date">
                    Safe Consumption / Pickup Deadline *
                  </label>
                  <input
                    type="date"
                    id="expiry_date"
                    name="expiry_date"
                    className="form-control"
                    min={today}
                    value={formData.expiry_date}
                    onChange={handleChange}
                    required
                  />
                  <span className="form-hint">Food must be collected before this date/time to ensure food safety.</span>
                </div>

                {/* Pickup Address */}
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label className="form-label" htmlFor="pickup_address">
                    Precise Pickup Location / Address *
                  </label>
                  <textarea
                    id="pickup_address"
                    name="pickup_address"
                    className="form-control"
                    rows={2}
                    placeholder="e.g. Kitchen Gate 2, BITS Campus Mess, Bengaluru. Call guard at entrance."
                    value={formData.pickup_address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <Link to="/donor-dashboard" className="btn btn-outline">
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? '⏳ Uploading & Publishing…' : '🚀 Post Food Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFood;
