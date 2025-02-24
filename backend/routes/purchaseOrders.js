const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// CREATE - Crear una orden de compra manualmente
router.post('/', async (req, res) => {
  const { product_id, supplier_id, quantity, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO purchase_orders (product_id, supplier_id, quantity, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [product_id, supplier_id, quantity, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Obtener todas las órdenes de compra
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT po.*, p.name AS product_name, s.name AS supplier_name
       FROM purchase_orders po
       JOIN products p ON po.product_id = p.id
       JOIN suppliers s ON po.supplier_id = s.id`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Obtener una orden de compra por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT po.*, p.name AS product_name, s.name AS supplier_name
       FROM purchase_orders po
       JOIN products p ON po.product_id = p.id
       JOIN suppliers s ON po.supplier_id = s.id
       WHERE po.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Purchase order not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Actualizar una orden de compra
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { product_id, supplier_id, quantity, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE purchase_orders
       SET product_id = $1, supplier_id = $2, quantity = $3, status = $4
       WHERE id = $5 RETURNING *`,
      [product_id, supplier_id, quantity, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Purchase order not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar una orden de compra
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM purchase_orders WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Purchase order not found' });
    res.json({ message: 'Purchase order deleted', purchaseOrder: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;