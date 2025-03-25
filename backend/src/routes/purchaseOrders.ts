import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../config/db';
import { authenticate, authorize } from '../middleware/auth';

const router: Router = express.Router();

interface PurchaseOrder {
  id?: number;
  product_id: number;
  supplier_id: number;
  quantity: number;
  order_date?: Date;
  status: 'pending' | 'processed' | 'completed' | 'cancelled';
  payment_type?: 'cash' | 'credit' | 'consignment'; // Opcional
  total_amount?: number; // Opcional
  product_name?: string;
  supplier_name?: string;
}

interface Product {
  id?: number;
  name: string;
  actual_stock: number;
  min_stock: number;
  supplier_id: number;
  price: number;
  category_id?: number;
}

// router.use(authenticate); // Todas las rutas después requieren token
// router.use(authorize(["superuser", "system_admin", "client_supermarket_1", "client_supermarket_2"])); // Todas las rutas después requieren roles específicos

// Register new product (Admin only)
// POST /products
router.post('/products', async (req: Request, res: Response) => {
  try {
    const { name, actual_stock, min_stock, supplier_id, price, category_id } = req.body;
    
    if (!name || !supplier_id || !price) {
      return res.status(400).json({ error: 'Nombre, supplier_id y precio son requeridos' });
    }

    const result = await pool.query(
      `INSERT INTO products (name, actual_stock, min_stock, supplier_id, price, category_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, actual_stock || 0, min_stock || 0, supplier_id, price, category_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Check stock levels and create purchase orders automatically
router.get('/check-stock', async (req: Request, res: Response) => {
  try {
    const lowStockProducts = await pool.query(
      `SELECT p.*, s.name as supplier_name
       FROM products p
       JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.actual_stock < p.min_stock`
    );

    const createdOrders = [];
    for (const product of lowStockProducts.rows) {
      const quantityToOrder = product.min_stock * 2 - product.actual_stock; // Order double the minimum stock
      const total_amount = quantityToOrder * product.price;

      const orderResult = await pool.query(
        `INSERT INTO purchase_orders (product_id, supplier_id, quantity, status, payment_type, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [product.id, product.supplier_id, quantityToOrder, 'pending', 'cash', total_amount]
      );
      createdOrders.push(orderResult.rows[0]);
    }

    res.json({
      message: `${createdOrders.length} purchase orders created`,
      orders: createdOrders
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// CREATE - Manual purchase order creation
router.post('/', async (req: Request, res: Response) => {
  try {
    const { product_id, supplier_id, quantity, payment_type, status }: Partial<PurchaseOrder> = req.body;

    if (!quantity) {
      return res.status(400).json({ error: 'Quantity is required' });
    }

    // Validate product and supplier exist
    const productCheck = await pool.query('SELECT price FROM products WHERE id = $1', [product_id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const total_amount = productCheck.rows[0].price * quantity;

    // Insert into purchase_orders (only columns that exist in the original schema)
    const result = await pool.query(
      `INSERT INTO purchase_orders (product_id, supplier_id, quantity, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [product_id, supplier_id, quantity, status || 'pending']
    );

    // Handle credit payment (adjusted for supplier_debts without status)
    if (payment_type === 'credit') {
      await pool.query(
        `INSERT INTO supplier_debts (supplier_id, amount)
         VALUES ($1, $2)`,
        [supplier_id, total_amount]
      );
    }

    // Handle consignment (assuming consignments has minimal columns)
    if (payment_type === 'consignment') {
      await pool.query(
        `INSERT INTO consignments (supplier_id)
         VALUES ($1)`,
        [supplier_id]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Process purchase order
router.post('/:id/process', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Obtener la orden de compra
    const order = await pool.query(
      `SELECT po.*, p.price FROM purchase_orders po
       JOIN products p ON po.product_id = p.id
       WHERE po.id = $1`,
      [id]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ error: 'Orden de compra no encontrada' });
    }

    const purchaseOrder = order.rows[0];

    // Actualizar el estado de la orden a 'completed'
    const updatedOrder = await pool.query(
      `UPDATE purchase_orders
       SET status = 'completed'
       WHERE id = $1 RETURNING *`,
      [id]
    );

    // Actualizar el stock del producto
    await pool.query(
      `UPDATE products
       SET actual_stock = actual_stock + $1
       WHERE id = $2`,
      [purchaseOrder.quantity, purchaseOrder.product_id]
    );

    // Registrar transacción solo si existe la columna 'amount' en transactions
    const paymentType = req.body.payment_type || 'cash'; // Obtener payment_type del cuerpo si se proporciona
    if (paymentType === 'cash') {
      const total_amount = purchaseOrder.quantity * purchaseOrder.price;
      await pool.query(
        `INSERT INTO transactions (amount)
         VALUES ($1)`,
        [total_amount]
      );
    }

    res.json(updatedOrder.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Get all purchase orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT po.*, p.name AS product_name, s.name AS supplier_name
       FROM purchase_orders po
       JOIN products p ON po.product_id = p.id
       JOIN suppliers s ON po.supplier_id = s.id`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Get purchase order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT po.*, p.name AS product_name, s.name AS supplier_name
       FROM purchase_orders po
       JOIN products p ON po.product_id = p.id
       JOIN suppliers s ON po.supplier_id = s.id
       WHERE po.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Purchase order not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// UPDATE - Update purchase order
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { product_id, supplier_id, quantity, status, payment_type }: Partial<PurchaseOrder> = req.body;
    
    if (!quantity) {
      return res.status(400).json({ error: 'Quantity is required' });
    }
    
    const product = await pool.query('SELECT price FROM products WHERE id = $1', [product_id]);
    const total_amount = product.rows[0].price * quantity;

    const result = await pool.query(
      `UPDATE purchase_orders
       SET product_id = $1, supplier_id = $2, quantity = $3, status = $4, payment_type = $5, total_amount = $6
       WHERE id = $7 RETURNING *`,
      [product_id, supplier_id, quantity, status, payment_type, total_amount, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Purchase order not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE - Delete purchase order
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM purchase_orders WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Purchase order not found' });
    } else {
      res.json({ message: 'Purchase order deleted', purchaseOrder: result.rows[0] });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;