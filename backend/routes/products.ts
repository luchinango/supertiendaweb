import express, { Router, Request, Response } from 'express';
import pool from '../config/db';

const router: Router = express.Router();

interface Product {
  id?: number;
  supplier_id: number;
  category_id: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  purchase_price: number;
  sale_price: number;
  sku?: string;
  barcode?: string;
  brand?: string;
  unit: string;
  min_stock: number;
  max_stock: number;
  actual_stock: number;
  expiration_date?: Date;
  image?: string;
}

// CREATE - Crear un producto
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      supplier_id,
      category_id,
      name,
      price,
      stock,
      description,
      purchase_price,
      sale_price,
      sku,
      barcode,
      brand,
      unit,
      min_stock,
      max_stock,
      actual_stock,
      expiration_date,
      image,
    }: Partial<Product> = req.body;

    const result = await pool.query(
      `INSERT INTO products (supplier_id, category_id, name, price, stock, description, purchase_price, sale_price, sku, barcode, brand, unit, min_stock, max_stock, actual_stock, expiration_date, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [
        supplier_id,
        category_id,
        name,
        price,
        stock,
        description,
        purchase_price,
        sale_price,
        sku,
        barcode,
        brand,
        unit,
        min_stock,
        max_stock,
        actual_stock,
        expiration_date,
        image,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener todos los productos
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name, s.name AS supplier_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       JOIN suppliers s ON p.supplier_id = s.id`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener un producto por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name, s.name AS supplier_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// UPDATE - Actualizar un producto
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      supplier_id,
      category_id,
      name,
      price,
      stock,
      description,
      purchase_price,
      sale_price,
      sku,
      barcode,
      brand,
      unit,
      min_stock,
      max_stock,
      actual_stock,
      expiration_date,
      image,
    }: Partial<Product> = req.body;

    const result = await pool.query(
      `UPDATE products
       SET supplier_id = $1, category_id = $2, name = $3, price = $4, stock = $5, description = $6, purchase_price = $7, sale_price = $8, sku = $9, barcode = $10, brand = $11, unit = $12, min_stock = $13, max_stock = $14, actual_stock = $15, expiration_date = $16, image = $17
       WHERE id = $18 RETURNING *`,
      [
        supplier_id,
        category_id,
        name,
        price,
        stock,
        description,
        purchase_price,
        sale_price,
        sku,
        barcode,
        brand,
        unit,
        min_stock,
        max_stock,
        actual_stock,
        expiration_date,
        image,
        id,
      ]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE - Eliminar un producto
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json({ message: 'Product deleted', product: result.rows[0] });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;