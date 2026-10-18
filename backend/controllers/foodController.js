// controllers/foodController.js
// Purpose: Handles CRUD operations for food listings in MySQL foodrescue_db.
// Includes image uploads, quantity tracking, storage details, and owner authorization.

const db = require('../config/db');

// ── 1. GET /api/food ─────────────────────────────────────────────────
// Purpose: Returns all available food listings joined with donor details.
// Used by NGOs and public visitors to discover donations.
const getAllFood = async (req, res) => {
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
};

// ── 2. GET /api/food/mine ────────────────────────────────────────────
// Purpose: Returns all listings posted by the authenticated donor.
const getMyFood = async (req, res) => {
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

// ── 3. GET /api/food/:id ─────────────────────────────────────────────
// Purpose: Returns detailed information for a single food listing.
const getFoodById = async (req, res) => {
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
};

// ── 4. POST /api/food ────────────────────────────────────────────────
// Purpose: Donor creates a new surplus food listing with photo and storage details.
const addFood = async (req, res) => {
  const food_name = req.body.food_name || req.body.title;
  const description = req.body.description || '';
  const quantity = req.body.quantity;
  const food_type = req.body.food_type === 'non-veg' ? 'non-veg' : req.body.food_type === 'both' ? 'both' : 'veg';
  const storage_details = req.body.storage_details || 'Room temperature / Clean containers';
  const preparation_time = req.body.preparation_time || 'Freshly prepared today';
  const pickup_address = req.body.pickup_address;
  const available_until = req.body.available_until || req.body.expiry_date;

  // 1. Validate required text fields
  if (!food_name || !quantity || !pickup_address || !available_until) {
    return res.status(400).json({
      message: 'Food name, quantity, pickup address, and collection deadline are required.',
    });
  }

  // 2. Validate that an image file was provided
  if (!req.file) {
    return res.status(400).json({
      message: 'Upload Food Image is required. Please select a photo of the food.',
    });
  }

  // Parse numeric servings/units for concurrency reservation tracking
  const numericMatch = String(quantity).match(/\d+/);
  const available_quantity = numericMatch ? parseInt(numericMatch[0], 10) : 10;
  const image_path = `/uploads/${req.file.filename}`;

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
        available_until,
      ]
    );

    res.status(201).json({
      message: 'Food listing with photo published successfully!',
      id: result.insertId,
      image: image_path,
      available_quantity,
    });
  } catch (error) {
    console.error('AddFood error:', error);
    res.status(500).json({ message: 'Server error while saving food listing to database' });
  }
};

// ── 5. PUT /api/food/:id/status ──────────────────────────────────────
// Purpose: Updates food listing status. Enforces donor ownership so users cannot edit others' listings.
const updateFoodStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['available', 'claimed', 'expired'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value. Must be available, claimed, or expired.' });
  }

  try {
    // Check ownership before updating
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
};

// ── 6. DELETE /api/food/:id ──────────────────────────────────────────
// Purpose: Donor deletes their own food listing.
const deleteFood = async (req, res) => {
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
};

module.exports = {
  getAllFood,
  getMyFood,
  getFoodById,
  addFood,
  updateFoodStatus,
  deleteFood,
};
