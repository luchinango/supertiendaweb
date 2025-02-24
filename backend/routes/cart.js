const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Crear carrito
router.post('/', async (req, res) => {
  const { customer_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cart (customer_id) VALUES ($1) RETURNING *',
      [customer_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar producto al carrito
router.post('/items', async (req, res) => {
  const { cart_id, product_id, quantity } = req.body;
  try {
    const product = await pool.query('SELECT price FROM products WHERE id = $1', [product_id]);
    const price_at_time = product.rows[0].price;
    const result = await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [cart_id, product_id, quantity, price_at_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener contenido del carrito
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT ci.*, p.name, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = $1',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;