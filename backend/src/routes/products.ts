import express, { Router, Request, Response } from 'express';
import pool from '../config/db';
import { authenticate, authorize } from '../middleware/auth';

console.log('Cargando products.ts - Versión actualizada al ' + new Date().toISOString());

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
  status?: string;
  shelf_life_days?: number;
  is_organic?: boolean;
}

// router.use(authenticate); // Todas las rutas después requieren token
// router.use(authorize(["superuser", "system_admin", "client_supermarket_1", "client_supermarket_2"])); // Todas las rutas después requieren roles específicos

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

// Generar código de barras EAN-13
function generateEAN13(): string {
  const prefix = '77'; // Prefijo de país (ejemplo: Colombia)
  const company = '12345'; // Código de empresa ficticio
  const sequence = Math.floor(Math.random() * 100000).toString().padStart(5, '0'); // Número aleatorio de 5 dígitos
  const baseCode = prefix + company + sequence;

  // Calcular dígito de control
  const digits = baseCode.split('').map(Number);
  const sum = digits.reduce((acc, digit, index) => {
    return acc + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);
  const checkDigit = (10 - (sum % 10)) % 10;

  return baseCode + checkDigit;
}

// Validar unicidad del barcode
async function isBarcodeUnique(barcode: string): Promise<boolean> {
  const result = await pool.query('SELECT EXISTS(SELECT 1 FROM products WHERE barcode = $1)', [barcode]);
  return !result.rows[0].exists;
}

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

// Crear un producto con barcode automático o manual
router.post('/', async (req: Request, res: Response) => {
  const productData: Product = req.body;

  try {
    // Si no se proporciona barcode, generarlo
    let barcode = productData.barcode;
    if (!barcode) {
      do {
        barcode = generateEAN13();
      } while (!(await isBarcodeUnique(barcode)));
    } else if (!(await isBarcodeUnique(barcode))) {
      return res.status(400).json({ error: 'Barcode must be unique' });
    }

    const query = `
      INSERT INTO products (supplier_id, name, price, description, purchase_price, sale_price, sku, barcode, brand, unit, min_stock, max_stock, actual_stock, expiration_date, image, category_id, status, shelf_life_days, is_organic)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *;
    `;
    const values = [
      productData.supplier_id,
      productData.name,
      productData.price,
      productData.description || null,
      productData.purchase_price || 0.00,
      productData.sale_price || 0.00,
      productData.sku || null,
      barcode,
      productData.brand || null,
      productData.unit || null,
      productData.min_stock || 0,
      productData.max_stock || 0,
      productData.actual_stock || 0,
      productData.expiration_date || null,
      productData.image || null,
      productData.category_id || null,
      productData.status || 'active',
      productData.shelf_life_days || null,
      productData.is_organic || false,
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Obtener producto por barcode
router.get('/barcode', async (req: Request, res: Response) => {
  const { barcode } = req.query;

  if (!barcode) {
    return res.status(400).json({ error: 'Barcode is required' });
  }

  try {
    const query = `
      SELECT id, name, sale_price, purchase_price, actual_stock, supplier_id
      FROM products
      WHERE barcode = $1;
    `;
    const result = await pool.query(query, [barcode]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Compra: Registrar entrada de producto (crédito o consignación)
router.post('/purchase', async (req: Request, res: Response) => {
  const { barcode, quantity, supplier_id, payment_type, user_id } = req.body;

  if (!barcode || !quantity || !supplier_id || !payment_type || !user_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Buscar producto
    const productQuery = 'SELECT id, purchase_price FROM products WHERE barcode = $1';
    const productResult = await pool.query(productQuery, [barcode]);
    if (productResult.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = productResult.rows[0];
    const totalAmount = product.purchase_price * quantity;

    // Actualizar stock
    await pool.query('UPDATE products SET actual_stock = actual_stock + $1 WHERE barcode = $2', [quantity, barcode]);

    if (payment_type === 'credit') {
      // Registrar deuda al proveedor
      const debtQuery = `
        INSERT INTO supplier_debts (supplier_id, user_id, amount, remaining_amount)
        VALUES ($1, $2, $3, $3)
        RETURNING *;
      `;
      const debtResult = await pool.query(debtQuery, [supplier_id, user_id, totalAmount]);
      return res.status(201).json({ message: 'Purchase registered with credit', debt: debtResult.rows[0] });
    } else if (payment_type === 'consignment') {
      // Registrar consignación
      const consignmentQuery = `
        INSERT INTO consignments (supplier_id, user_id, start_date, total_value)
        VALUES ($1, $2, CURRENT_DATE, $3)
        RETURNING id;
      `;
      const consignmentResult = await pool.query(consignmentQuery, [supplier_id, user_id, totalAmount]);
      const consignmentId = consignmentResult.rows[0].id;

      await pool.query(
        'INSERT INTO consignment_items (consignment_id, product_id, quantity_sent) VALUES ($1, $2, $3)',
        [consignmentId, product.id, quantity]
      );
      return res.status(201).json({ message: 'Purchase registered as consignment', consignment_id: consignmentId });
    } else {
      // Pago en efectivo (no registra deuda ni consignación)
      return res.status(201).json({ message: 'Purchase registered (cash)' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Venta: Registrar salida de producto (efectivo o crédito)
router.post('/sell', async (req: Request, res: Response) => {
  const { barcode, quantity, customer_id, payment_type, user_id } = req.body;

  if (!barcode || !quantity || !customer_id || !payment_type || !user_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Buscar producto
    const productQuery = 'SELECT id, sale_price, actual_stock FROM products WHERE barcode = $1';
    const productResult = await pool.query(productQuery, [barcode]);
    if (productResult.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = productResult.rows[0];
    if (product.actual_stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    const totalAmount = product.sale_price * quantity;

    // Actualizar stock
    await pool.query('UPDATE products SET actual_stock = actual_stock - $1 WHERE barcode = $2', [quantity, barcode]);

    // Registrar transacción
    const transactionQuery = `
      INSERT INTO transactions (customer_id, user_id, amount, type)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const transactionResult = await pool.query(transactionQuery, [customer_id, user_id, totalAmount, payment_type]);

    if (payment_type === 'credit') {
      // Actualizar crédito del cliente
      await pool.query(
        'UPDATE credits SET balance = balance + $1 WHERE customer_id = $2',
        [totalAmount, customer_id]
      );
    }

    res.status(201).json({ message: 'Sale registered', transaction: transactionResult.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
