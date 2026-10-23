// FoodCard.jsx - Card component for displaying a food listing
import StatusBadge from './StatusBadge';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Today';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
};

const FoodCard = ({ food, showRequestBtn = false, onRequest }) => {
  // Determine uploaded image URL (served from backend /uploads)
  let imageSrc = null;
  if (food.image && typeof food.image === 'string') {
    if (food.image.startsWith('/uploads') || food.image.startsWith('http')) {
      imageSrc = food.image;
    } else if (food.image.startsWith('uploads')) {
      imageSrc = `/${food.image}`;
    } else {
      imageSrc = `/uploads/${food.image}`;
    }
  }


  const donorName = food.organization || food.donor_name || 'Verified Donor';
  const avatarLetter = donorName.charAt(0).toUpperCase();
  const displayTitle = food.title || food.food_name || 'Food Listing';

  return (
    <div className="food-card">
      {/* If an image was uploaded, display it in full resolution with complete visibility */}
      {imageSrc ? (
        <div className="food-card-img-wrap">
          {/* Ambient blurred backdrop to frame the photo smoothly */}
          <img src={imageSrc} alt="" className="food-card-img-blur" aria-hidden="true" />
          
          {/* Full crisp uncropped image */}
          <img
            src={imageSrc}
            alt={displayTitle}
            className="food-card-img-main"
            loading="lazy"
          />

          <div className="food-card-badges">
            <StatusBadge status={food.status || 'available'} />
            <StatusBadge status={food.food_type || 'veg'} />
          </div>

          <div className="food-card-time-badge">
            ⏳ {formatDate(food.expiry_date || food.available_until)}
          </div>
        </div>
      ) : (
        /* If no image was uploaded, show a clean modern placeholder (NO fake sample photos) */
        <div className="food-card-no-img">
          <span className="no-img-icon">🍱</span>
          <span className="no-img-text">No Photo Uploaded</span>

          <div className="food-card-badges">
            <StatusBadge status={food.status || 'available'} />
            <StatusBadge status={food.food_type || 'veg'} />
          </div>

          <div className="food-card-time-badge">
            ⏳ {formatDate(food.expiry_date || food.available_until)}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="food-card-body">
        <h3 className="food-card-title">{displayTitle}</h3>
        <p className="food-card-desc">
          {food.description || 'Freshly prepared food available for pickup and redistribution to communities.'}
        </p>

        <div className="food-card-meta">
          <div className="food-card-meta-row">
            <span className="meta-icon">📦</span>
            <span>
              <strong>Quantity:</strong> {food.quantity}
              {food.available_quantity !== undefined && food.available_quantity !== null && (
                <span style={{ color: 'var(--g-700)', fontWeight: 600, marginLeft: '0.4rem' }}>
                  ({food.available_quantity} available)
                </span>
              )}
            </span>
          </div>
          {food.preparation_time && (
            <div className="food-card-meta-row">
              <span className="meta-icon">⏱️</span>
              <span><strong>Prepared:</strong> {food.preparation_time}</span>
            </div>
          )}
          {food.storage_details && (
            <div className="food-card-meta-row">
              <span className="meta-icon">❄️</span>
              <span><strong>Storage:</strong> {food.storage_details}</span>
            </div>
          )}
          <div className="food-card-meta-row">
            <span className="meta-icon">📍</span>
            <span><strong>Pickup:</strong> {food.pickup_address}</span>
          </div>
          <div className="food-card-meta-row">
            <span className="meta-icon">⏳</span>
            <span><strong>Deadline:</strong> {formatDate(food.expiry_date || food.available_until)}</span>
          </div>
        </div>

        {showRequestBtn && (food.status === 'available' || !food.status) && (
          <button
            type="button"
            className="btn btn-primary btn-sm btn-full"
            style={{ marginTop: 'auto' }}
            onClick={() => onRequest && onRequest(food)}
          >
            🙏 Request Food
          </button>
        )}
      </div>

      {/* Footer / Donor attribution */}
      <div className="food-card-footer">
        <div className="food-card-donor">
          <div className="food-card-donor-avatar">{avatarLetter}</div>
          <span className="food-card-donor-name" title={donorName}>
            {donorName}
          </span>
        </div>
        {food.donor_phone && (
          <span style={{ fontSize: '0.78rem', color: 'var(--n-500)', whiteSpace: 'nowrap' }}>
            📞 {food.donor_phone}
          </span>
        )}
      </div>
    </div>
  );
};

export default FoodCard;
