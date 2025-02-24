const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// CREATE - Crear un producto
router.post('/', async (req, res) => {
  const { supplier_id, category_id, name, price, stock, description, purchase_price, sale_price, sku, barcode, brand, unit, min_stock, max_stock, actual_stock, expiration_date, image } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (supplier_id, category_id, name, price, stock, description, purchase_price, sale_price, sku, barcode, brand, unit, min_stock, max_stock, actual_stock, expiration_date, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [supplier_id, category_id, name, price, stock, description, purchase_price, sale_price, sku, barcode, brand, unit, min_stock, max_stock, actual_stock, expiration_date, image]
    );
    const product = result.rows[0];

    // Generar orden de compra si actual_stock < min_stock
    if (product.actual_stock < product.min_stock) {
      const quantityToOrder = product.max_stock - product.actual_stock;
      await pool.query(
        `INSERT INTO purchase_orders (product_id, supplier_id, quantity, status)
         VALUES ($1, $2, $3, $4)`,
        [product.id, product.supplier_id, quantityToOrder, 'pending']
      );
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Obtener un producto por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Actualizar un producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { supplier_id, name, price, stock, description, purchase_price, sale_price, sku, barcode, category, subcategory, brand, unit, min_stock, max_stock, actual_stock, expiration_date, image } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products SET supplier_id = $1, name = $2, price = $3, stock = $4, description = $5, purchase_price = $6, sale_price = $7, sku = $8, barcode = $9, category = $10, subcategory = $11, brand = $12, unit = $13, min_stock = $14, max_stock = $15, actual_stock = $16, expiration_date = $17, image = $18
       WHERE id = $19 RETURNING *`,
      [supplier_id, name, price, stock, description, purchase_price, sale_price, sku, barcode, category, subcategory, brand, unit, min_stock, max_stock, actual_stock, expiration_date, image, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar un producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted', product: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;