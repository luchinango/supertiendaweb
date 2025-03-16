import express, { Router, Request, Response } from 'express';
import pool from '../config/db';
import { authenticate, authorize } from '../middleware/auth';

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

router.use(authenticate); // Todas las rutas después requieren token
router.use(authorize(["superuser", "system_admin", "client_supermarket_1", "client_supermarket_2"])); // Todas las rutas después requieren roles específicos

// CREATE - Crear un producto
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      supplier_id,
      category_id,
      name,
      price,
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
      `INSERT INTO products (supplier_id, category_id, name, price, description, purchase_price, sale_price, sku, barcode, brand, unit, min_stock, max_stock, actual_stock, expiration_date, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        supplier_id,
        category_id,
        name,
        price,
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

// PUT - Actualizar un producto
router.put('/:id', async (req: Request, res: Response) => {
  const productId = parseInt(req.params.id, 10);
  const {
    supplier_id, name, price, stock, description, purchase_price, sale_price,
    sku, barcode, brand, unit, min_stock, max_stock, actual_stock,
    expiration_date, image, category_id
  } = req.body;

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'El ID del producto debe ser un número válido' });
  }

  try {
    const result = await pool.query(
      `UPDATE products 
       SET supplier_id = $1, name = $2, price = $3, stock = $4, description = $5,
           purchase_price = $6, sale_price = $7, sku = $8, barcode = $9, brand = $10,
           unit = $11, min_stock = $12, max_stock = $13, actual_stock = $14,
           expiration_date = $15, image = $16, category_id = $17
       WHERE id = $18
       RETURNING *`,
      [
        supplier_id, name, price, stock, description || null, purchase_price || 0,
        sale_price || 0, sku || null, barcode || null, brand || null, unit || null,
        min_stock || 0, max_stock || 0, actual_stock || 0, expiration_date || null,
        image || null, category_id, productId
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `No se encontró un producto con ID ${productId}` });
    }

    res.status(200).json({ message: `Producto con ID ${productId} actualizado correctamente`, data: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al intentar actualizar el producto', details: (error as Error).message });
  }
});

// DELETE - Inactivar un producto (genérico)
router.post('/delete/:id', async (req: Request, res: Response) => {
  const productId = parseInt(req.params.id, 10);

  // Validar que el ID sea un número válido
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'El ID del producto debe ser un número válido' });
  }

  try {
    // Actualizar el status a 'inactive' directamente
    const result = await pool.query(
      `UPDATE products 
       SET status = 'inactive' 
       WHERE id = $1 
       RETURNING id, name, status`,
      [productId]
    );

    // Verificar si se actualizó algún registro
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `No se encontró un producto con ID ${productId}` });
    }

    res.status(200).json({ 
      message: `Producto con ID ${productId} desactivado correctamente`, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error al desactivar producto:', error);
    res.status(500).json({ 
      error: 'Error al intentar desactivar el producto', 
      details: (error as Error).message 
    });
  }
});

// PATCH - Actualizar parcialmente un producto
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<Product> = req.body;

    // Obtener el producto existente para mantener los valores no proporcionados
    const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Construir la consulta dinámica con solo los campos proporcionados
    const fields = Object.keys(updates).filter(key => key !== 'id');
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = fields.map(field => updates[field as keyof Partial<Product>]);

    const result = await pool.query(
      `UPDATE products SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;