// controllers/requestController.js
// Purpose: Handles NGO food requests, status updates, and pickup coordination.
// Uses MySQL transactions for atomic quantity reservation so concurrent requests cannot exceed available food.

const db = require('../config/db');

// ── 1. GET /api/requests/mine (also /api/requests/my) ─────────────────
// Purpose: Returns all requests submitted by the authenticated NGO.
const getMyRequests = async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT r.id, r.food_id, r.ngo_id, r.requested_quantity, r.message, r.status,
              r.request_date, r.request_date AS created_at,
              f.food_name, f.food_name AS food_title, f.quantity, f.available_quantity,
              f.pickup_address, f.storage_details, f.preparation_time,
              f.available_until, f.available_until AS expiry_date,
              u.name AS donor_name, u.phone AS donor_phone
       FROM food_requests r
       JOIN food_listings f ON r.food_id = f.id
       JOIN users u ON f.donor_id = u.id
       WHERE r.ngo_id = ?
       ORDER BY r.request_date DESC`,
      [req.user.id]
    );
    res.json(requests);
  } catch (error) {
    console.error('GetMyRequests error:', error);
    res.status(500).json({ message: 'Server error while fetching your requests' });
  }
};

// ── 2. GET /api/requests/incoming ────────────────────────────────────
// Purpose: Returns requests placed on food listings created by the authenticated donor.
const getIncomingRequests = async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT r.id, r.food_id, r.ngo_id, r.requested_quantity, r.message, r.status,
              r.request_date, r.request_date AS created_at,
              f.food_name, f.food_name AS food_title, f.quantity, f.available_quantity,
              f.pickup_address, f.storage_details, f.available_until,
              u.name AS ngo_name, u.phone AS ngo_phone
       FROM food_requests r
       JOIN food_listings f ON r.food_id = f.id
       JOIN users u ON r.ngo_id = u.id
       WHERE f.donor_id = ?
       ORDER BY r.request_date DESC`,
      [req.user.id]
    );
    res.json(requests);
  } catch (error) {
    console.error('GetIncomingRequests error:', error);
    res.status(500).json({ message: 'Server error while fetching incoming requests' });
  }
};

// ── 3. POST /api/requests ────────────────────────────────────────────
// Purpose: NGO requests an available food listing with specified quantity and note.
const createRequest = async (req, res) => {
  const { food_id, requested_quantity, message } = req.body;

  if (!food_id) {
    return res.status(400).json({ message: 'Food listing ID is required' });
  }

  try {
    // 1. Check if the food listing exists and is currently available
    const [foods] = await db.query('SELECT * FROM food_listings WHERE id = ?', [food_id]);
    if (foods.length === 0) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    const food = foods[0];
    if (food.status !== 'available') {
      return res.status(400).json({ message: 'This food listing is no longer available for requests' });
    }

    // 2. Prevent duplicate pending requests from the same NGO
    const [existing] = await db.query(
      'SELECT id FROM food_requests WHERE food_id = ? AND ngo_id = ? AND status = "pending"',
      [food_id, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You already have an active pending request for this food listing' });
    }

    // 3. Determine requested quantity string and check that it does not exceed available
    const finalQuantity = requested_quantity ? String(requested_quantity).trim() : food.quantity;
    const requestedNum = parseInt(finalQuantity, 10);
    const availableNum = food.available_quantity !== null ? food.available_quantity : parseInt(food.quantity, 10);

    if (!isNaN(requestedNum) && !isNaN(availableNum) && requestedNum > availableNum) {
      return res.status(400).json({
        message: `Requested quantity (${requestedNum}) cannot exceed available food (${availableNum}).`,
      });
    }

    // 4. Save the request to MySQL food_requests table
    const [result] = await db.query(
      `INSERT INTO food_requests (food_id, ngo_id, requested_quantity, message, status, request_date)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [food_id, req.user.id, finalQuantity, message ? message.trim() : null]
    );

    res.status(201).json({
      message: 'Request submitted successfully! Saved to MySQL database.',
      requestId: result.insertId,
    });
  } catch (error) {
    console.error('CreateRequest error:', error);
    res.status(500).json({ message: 'Server error while submitting food request' });
  }
};

// ── 4. PATCH /api/requests/:id/status (and PUT) ──────────────────────
// Purpose: Updates request status through the core workflow:
// pending ➔ accepted (with MySQL transaction quantity reservation) ➔ collected ➔ completed (or rejected).
const updateRequestStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['accepted', 'rejected', 'collected', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: 'Invalid status. Allowed values: accepted, rejected, collected, completed, cancelled',
    });
  }

  // Fetch the request and associated food listing
  const [requests] = await db.query(
    `SELECT r.*, f.donor_id, f.food_name, f.quantity AS food_total_qty, f.available_quantity, f.status AS food_status
     FROM food_requests r
     JOIN food_listings f ON r.food_id = f.id
     WHERE r.id = ?`,
    [req.params.id]
  );

  if (requests.length === 0) {
    return res.status(404).json({ message: 'Request not found' });
  }

  const request = requests[0];
  const isDonor = request.donor_id === req.user.id;
  const isNgo = request.ngo_id === req.user.id;

  // Authorization:
  // - Donors can accept, reject, mark collected, or complete requests on their listings.
  // - NGOs can coordinate and mark their own accepted requests as collected or completed.
  if (!isDonor && !isNgo) {
    return res.status(403).json({ message: 'Not authorized to update this food request' });
  }

  // Only donor can accept or reject
  if ((status === 'accepted' || status === 'rejected') && !isDonor) {
    return res.status(403).json({ message: 'Only the food donor can approve or reject this request' });
  }

  // ── CASE 1: APPROVE REQUEST (Use MySQL Transaction for atomic quantity reservation) ──
  if (status === 'accepted') {
    if (request.status === 'accepted') {
      return res.json({ message: 'Request is already accepted' });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Lock row FOR UPDATE to prevent race conditions when multiple NGOs request concurrently
      const [lockedFood] = await connection.query(
        'SELECT id, quantity, available_quantity, status FROM food_listings WHERE id = ? FOR UPDATE',
        [request.food_id]
      );

      if (lockedFood.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Food listing not found' });
      }

      const food = lockedFood[0];
      const parsedReqQty = parseInt(request.requested_quantity, 10);
      const reqQty = !isNaN(parsedReqQty) && parsedReqQty > 0 ? parsedReqQty : 1;
      
      const currentAvailable = food.available_quantity !== null
        ? food.available_quantity
        : (parseInt(food.quantity, 10) || 1);

      if (reqQty > currentAvailable) {
        await connection.rollback();
        return res.status(400).json({
          message: `Cannot approve request: requested quantity (${reqQty}) exceeds remaining available food (${currentAvailable}).`,
        });
      }

      // Reserve the approved quantity
      const newAvailable = currentAvailable - reqQty;
      const newFoodStatus = newAvailable <= 0 ? 'claimed' : 'available';

      // Update food listing available quantity and status
      await connection.query(
        'UPDATE food_listings SET available_quantity = ?, status = ? WHERE id = ?',
        [newAvailable, newFoodStatus, request.food_id]
      );

      // Update request status to 'accepted'
      await connection.query('UPDATE food_requests SET status = "accepted" WHERE id = ?', [req.params.id]);

      await connection.commit();
      return res.json({
        message: 'Request approved! Quantity reserved successfully via MySQL transaction.',
        remainingQuantity: newAvailable,
      });
    } catch (transactionErr) {
      await connection.rollback();
      console.error('Approval transaction error:', transactionErr);
      return res.status(500).json({ message: 'Database transaction error while reserving food quantity' });
    } finally {
      connection.release();
    }
  }

  // ── CASE 2: REJECT / COLLECTED / COMPLETED / CANCELLED ────────────────
  try {
    // If an accepted request is subsequently rejected or cancelled, return the reserved quantity back
    if ((status === 'rejected' || status === 'cancelled') && request.status === 'accepted') {
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();

        const [lockedFood] = await connection.query(
          'SELECT id, quantity, available_quantity FROM food_listings WHERE id = ? FOR UPDATE',
          [request.food_id]
        );

        if (lockedFood.length > 0) {
          const food = lockedFood[0];
          const parsedReqQty = parseInt(request.requested_quantity, 10);
          const reqQty = !isNaN(parsedReqQty) && parsedReqQty > 0 ? parsedReqQty : 1;
          const restored = (food.available_quantity || 0) + reqQty;

          await connection.query(
            'UPDATE food_listings SET available_quantity = ?, status = "available" WHERE id = ?',
            [restored, request.food_id]
          );
        }

        await connection.query('UPDATE food_requests SET status = ? WHERE id = ?', [status, req.params.id]);
        await connection.commit();
        return res.json({ message: `Request marked as ${status} and reserved quantity returned to listing.` });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }

    // Normal status transition: e.g. accepted -> collected -> completed
    await db.query('UPDATE food_requests SET status = ? WHERE id = ?', [status, req.params.id]);

    res.json({ message: `Request status updated to "${status}" successfully!` });
  } catch (error) {
    console.error('UpdateRequestStatus error:', error);
    res.status(500).json({ message: 'Server error while updating request status' });
  }
};

module.exports = {
  getMyRequests,
  getIncomingRequests,
  createRequest,
  updateRequestStatus,
};
