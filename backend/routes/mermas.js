const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// CREATE - Registrar una merma
router.post('/', async (req, res) => {
  const { product_id, quantity, type, date, value, responsible_id, observations } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO mermas (product_id, quantity, type, date, value, responsible_id, observations)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [product_id, quantity, type, date, value, responsible_id, observations]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Obtener todas las mermas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, p.name AS product_name, u.first_name || ' ' || u.last_name AS responsible_name
       FROM mermas m
       JOIN products p ON m.product_id = p.id
       JOIN users u ON m.responsible_id = u.id`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Obtener una merma por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT m.*, p.name AS product_name, u.first_name || ' ' || u.last_name AS responsible_name
       FROM mermas m
       JOIN products p ON m.product_id = p.id
       JOIN users u ON m.responsible_id = u.id
       WHERE m.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Merma not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Actualizar una merma
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { product_id, quantity, type, date, value, responsible_id, observations } = req.body;
  try {
    const result = await pool.query(
      `UPDATE mermas
       SET product_id = $1, quantity = $2, type = $3, date = $4, value = $5, responsible_id = $6, observations = $7
       WHERE id = $8 RETURNING *`,
      [product_id, quantity, type, date, value, responsible_id, observations, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Merma not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar una merma
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM mermas WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Merma not found' });
    res.json({ message: 'Merma deleted', merma: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;