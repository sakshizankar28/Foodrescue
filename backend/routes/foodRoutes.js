// routes/foodRoutes.js
// Handles CRUD operations, image uploads, quantity tracking, and status updates for food listings.

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { protect, allowRoles } = require('../middleware/authMiddleware');

// ── Multer Storage Configuration for Food Photos ─────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `food-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext) && (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, and PNG images are allowed.'), false);
  }
};

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

// ── 1. GET /api/food - View all food listings ─────────────────────────
router.get('/', async (req, res) => {
  try {
    const [foods] = await db.query(`
      SELECT f.id, f.donor_id, f.food_name, f.food_name AS title, f.description,
             f.food_type, f.storage_details, f.quantity, f.available_quantity,
             f.pickup_address, f.image, f.preparation_time, f.prepared_at,
             f.available_until, f.available_until AS expiry_date,
             f.status, f.created_at,
             u.name AS donor_name, u.phone AS donor_phone
      FROM food_listings f
      JOIN users u ON f.donor_id = u.id
      ORDER BY f.created_at DESC
    `);
    res.json(foods);
  } catch (error) {
    console.error('GetAllFood error:', error);
    res.status(500).json({ message: 'Server error while fetching food listings' });
  }
});

// ── 2. GET /api/food/mine (also /my) - Food posted by logged-in donor ──
const getMyFoodHandler = async (req, res) => {
  try {
    const [foods] = await db.query(
      `SELECT id, donor_id, food_name, food_name AS title, description,
              food_type, storage_details, quantity, available_quantity,
              pickup_address, image, preparation_time, prepared_at,
              available_until, available_until AS expiry_date,
              status, created_at
       FROM food_listings
       WHERE donor_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(foods);
  } catch (error) {
    console.error('GetMyFood error:', error);
    res.status(500).json({ message: 'Server error while fetching your listings' });
  }
};

router.get('/mine', protect, allowRoles('donor'), getMyFoodHandler);
router.get('/my', protect, allowRoles('donor'), getMyFoodHandler);

// ── 3. GET /api/food/:id - Details of a single listing ────────────────
router.get('/:id', async (req, res) => {
  try {
    const [foods] = await db.query(
      `SELECT f.id, f.donor_id, f.food_name, f.food_name AS title, f.description,
              f.food_type, f.storage_details, f.quantity, f.available_quantity,
              f.pickup_address, f.image, f.preparation_time, f.prepared_at,
              f.available_until, f.available_until AS expiry_date,
              f.status, f.created_at,
              u.name AS donor_name, u.phone AS donor_phone
       FROM food_listings f
       JOIN users u ON f.donor_id = u.id
       WHERE f.id = ?`,
      [req.params.id]
    );

    if (foods.length === 0) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    res.json(foods[0]);
  } catch (error) {
    console.error('GetFoodById error:', error);
    res.status(500).json({ message: 'Server error while fetching listing details' });
  }
});

// ── 4. POST /api/food - Donor creates a new listing ───────────────────
router.post('/', protect, allowRoles('donor'), upload.single('image'), async (req, res) => {
  const food_name = req.body.food_name || req.body.title;
  const description = req.body.description || '';
  const quantity = req.body.quantity;
  const food_type = req.body.food_type === 'non-veg' ? 'non-veg' : req.body.food_type === 'both' ? 'both' : 'veg';
  const storage_details = req.body.storage_details || 'Room temperature / Clean containers';
  const preparation_time = req.body.preparation_time || 'Freshly prepared today';
  const pickup_address = req.body.pickup_address;
  const available_until = req.body.available_until || req.body.expiry_date;

  if (!food_name || !quantity || !pickup_address || !available_until) {
    return res.status(400).json({
      message: 'Food name, quantity, pickup address, and collection deadline are required.',
    });
  }

  let formattedAvailableUntil = available_until;
  if (formattedAvailableUntil && /^\d{4}-\d{2}-\d{2}$/.test(formattedAvailableUntil)) {
    formattedAvailableUntil = `${formattedAvailableUntil} 23:59:59`;
  }

  const numericMatch = String(quantity).match(/\d+/);
  const available_quantity = numericMatch ? parseInt(numericMatch[0], 10) : 10;
  const image_path = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await db.query(
      `INSERT INTO food_listings 
        (donor_id, food_name, description, food_type, storage_details, quantity, available_quantity, pickup_address, image, preparation_time, available_until, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
      [
        req.user.id,
        food_name.trim(),
        description.trim(),
        food_type,
        storage_details.trim(),
        quantity.trim(),
        available_quantity,
        pickup_address.trim(),
        image_path,
        preparation_time.trim(),
        formattedAvailableUntil,
      ]
    );

    res.status(201).json({
      message: 'Food listing published successfully! Saved to MySQL.',
      id: result.insertId,
      image: image_path,
      available_quantity,
    });
  } catch (error) {
    console.error('AddFood error:', error);
    res.status(500).json({ message: 'Server error while saving food listing to database' });
  }
});

// ── 5. PUT /api/food/:id/status - Update food listing status ──────────
router.put('/:id/status', protect, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['available', 'claimed', 'expired'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value. Must be available, claimed, or expired.' });
  }

  try {
    const [existing] = await db.query('SELECT donor_id FROM food_listings WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    if (existing[0].donor_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. You can only update your own food listings.' });
    }

    await db.query('UPDATE food_listings SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Listing status updated successfully' });
  } catch (error) {
    console.error('UpdateFoodStatus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── 6. DELETE /api/food/:id - Donor deletes their own listing ─────────
router.delete('/:id', protect, allowRoles('donor'), async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM food_listings WHERE id = ? AND donor_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: 'Not authorized to delete this listing or listing does not exist' });
    }

    res.json({ message: 'Food listing deleted successfully' });
  } catch (error) {
    console.error('DeleteFood error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
