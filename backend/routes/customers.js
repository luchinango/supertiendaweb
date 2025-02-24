const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// CREATE - Crear un cliente
router.post('/', async (req, res) => {
  const { user_id, first_name, last_name, address, phone, company_name, tax_id, email } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO customers (user_id, first_name, last_name, address, phone, company_name, tax_id, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [user_id, first_name, last_name, address, phone, company_name, tax_id, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Obtener un cliente por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Actualizar un cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, first_name, last_name, address, phone, company_name, tax_id, email } = req.body;
  try {
    const result = await pool.query(
      `UPDATE customers SET user_id = $1, first_name = $2, last_name = $3, address = $4, phone = $5, company_name = $6, tax_id = $7, email = $8
       WHERE id = $9 RETURNING *`,
      [user_id, first_name, last_name, address, phone, company_name, tax_id, email, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar un cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted', customer: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;