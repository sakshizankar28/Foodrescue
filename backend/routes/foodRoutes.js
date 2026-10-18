// routes/foodRoutes.js
// Purpose: Defines all endpoints related to food listings.

const express = require('express');
const router = express.Router();

const {
  getAllFood,
  getMyFood,
  getFoodById,
  addFood,
  updateFoodStatus,
  deleteFood,
} = require('../controllers/foodController');

const { protect, allowRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 1. GET /api/food - View all food listings (public, used by NGOs & visitors)
router.get('/', getAllFood);

// 2. GET /api/food/mine (also /api/food/my) - View food posted by logged-in donor
router.get('/mine', protect, allowRoles('donor'), getMyFood);
router.get('/my', protect, allowRoles('donor'), getMyFood);

// 3. GET /api/food/:id - View details of a single food listing
router.get('/:id', getFoodById);

// 4. POST /api/food - Donor posts a new surplus food listing with food photo upload
router.post('/', protect, allowRoles('donor'), upload.single('image'), addFood);

// 5. PUT /api/food/:id/status - Update food listing status
router.put('/:id/status', protect, updateFoodStatus);

// 6. DELETE /api/food/:id - Donor deletes their own food listing
router.delete('/:id', protect, allowRoles('donor'), deleteFood);

module.exports = router;

