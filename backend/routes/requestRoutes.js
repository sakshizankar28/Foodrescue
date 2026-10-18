// routes/requestRoutes.js
// Purpose: Defines all endpoints related to food requests.

const express = require('express');
const router = express.Router();

const {
  getMyRequests,
  getIncomingRequests,
  createRequest,
  updateRequestStatus,
} = require('../controllers/requestController');

const { protect, allowRoles } = require('../middleware/authMiddleware');

// 1. GET /api/requests/mine (also /api/requests/my) - NGO views their own requests
router.get('/mine', protect, allowRoles('ngo'), getMyRequests);
router.get('/my', protect, allowRoles('ngo'), getMyRequests);

// 2. GET /api/requests/incoming - Donor views requests placed on their food listings
router.get('/incoming', protect, allowRoles('donor'), getIncomingRequests);

// 3. POST /api/requests - NGO submits a request for a food listing
router.post('/', protect, allowRoles('ngo'), createRequest);

// 4. PATCH /api/requests/:id/status (and PUT) - Donor accepts/rejects, Donor/NGO marks collected/completed
router.patch('/:id/status', protect, allowRoles('donor', 'ngo'), updateRequestStatus);
router.put('/:id/status', protect, allowRoles('donor', 'ngo'), updateRequestStatus);

module.exports = router;

