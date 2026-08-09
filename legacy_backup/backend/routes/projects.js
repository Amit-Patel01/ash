const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/projects - List all active projects (with optional category filter)
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM projects p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }

    if (featured === 'true') {
      query += ' AND p.is_featured = TRUE';
    }

    query += ' ORDER BY p.is_featured DESC, p.created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

// GET /api/projects/categories - List all categories (MUST be before /:slug route)
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM categories ORDER BY display_order ASC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// GET /api/projects/:slug - Get single project by slug
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM projects p
       JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = TRUE`,
      [req.params.slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch project' });
  }
});

// POST /api/projects/checkout - Submit order
router.post('/checkout', async (req, res) => {
  try {
    const { project_id, customer_name, customer_email, purchase_type, payment_screenshot_url } = req.body;

    if (!project_id || !customer_name || !customer_email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Get project price
    const [projects] = await pool.execute(
      'SELECT price_project_only, price_with_source FROM projects WHERE id = ? AND is_active = TRUE',
      [project_id]
    );

    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const project = projects[0];
    const amount = purchase_type === 'project_with_source'
      ? project.price_with_source
      : project.price_project_only;

    const [result] = await pool.execute(
      `INSERT INTO orders (project_id, customer_name, customer_email, purchase_type, amount, payment_screenshot_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [project_id, customer_name, customer_email, purchase_type || 'project_only', amount, payment_screenshot_url || null]
    );

    res.json({
      success: true,
      message: 'Order submitted successfully',
      data: { order_id: result.insertId, amount }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to submit order' });
  }
});

module.exports = router;
