// StatusBadge.jsx - Reusable colored badge for showing statuses
// Supports: available, claimed, expired, pending, accepted, rejected, veg, non-veg, both

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const norm = status.toLowerCase().replace(/[-\s]/g, '');

  const config = {
    available: { cls: 'badge-available', label: 'Available' },
    claimed:   { cls: 'badge-claimed',   label: 'Claimed'   },
    expired:   { cls: 'badge-expired',   label: 'Expired'   },
    pending:   { cls: 'badge-pending',   label: 'Pending'   },
    accepted:  { cls: 'badge-accepted',  label: 'Accepted'  },
    collected: { cls: 'badge-pending',   label: '📦 Collected' },
    completed: { cls: 'badge-available', label: '🎉 Completed' },
    rejected:  { cls: 'badge-rejected',  label: 'Rejected'  },
    veg:       { cls: 'badge-veg',       label: '🌿 Veg'    },
    nonveg:    { cls: 'badge-nonveg',    label: '🍗 Non-Veg'},
    both:      { cls: 'badge-both',      label: '🍽️ Both'   },
  };

  const badgeInfo = config[norm] || { cls: 'badge-expired', label: status };

  return <span className={`badge ${badgeInfo.cls}`}>{badgeInfo.label}</span>;
};

export default StatusBadge;
