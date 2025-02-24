const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// CREATE - Crear un proveedor
router.post('/', async (req, res) => {
  const { name, contact, phone, email, company_name, tax_id, address, supplier_type, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO suppliers (name, contact, phone, email, company_name, tax_id, address, supplier_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, contact, phone, email, company_name, tax_id, address, supplier_type, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Obtener todos los proveedores
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Obtener un proveedor por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Actualizar un proveedor
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, contact, phone, email, company_name, tax_id, address, supplier_type, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE suppliers SET name = $1, contact = $2, phone = $3, email = $4, company_name = $5, tax_id = $6, address = $7, supplier_type = $8, status = $9
       WHERE id = $10 RETURNING *`,
      [name, contact, phone, email, company_name, tax_id, address, supplier_type, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar un proveedor
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ message: 'Supplier deleted', supplier: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;