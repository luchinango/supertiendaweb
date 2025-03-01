import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../config/db';
import { CreditService } from '../services/creditService';

const router: Router = express.Router();

interface Supplier {
  id?: number;
  name: string;
  contact: string;
  phone: string;
  email: string;
  company_name: string;
  tax_id: string;
  address?: string;
  supplier_type: string;
  status: string;
}

router.post('/debts', (req, res) => {
  CreditService.createSupplierDebt(req.body.supplierId, req.body.totalAmount)
    .then(debt => res.status(201).json(debt))
    .catch(err => res.status(400).json({ error: err.message }));
});

// CREATE - Crear un proveedor
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, contact, phone, email, company_name, tax_id, address, supplier_type, status }: Partial<Supplier> = req.body;
    const result = await pool.query(
      `INSERT INTO suppliers (name, contact, phone, email, company_name, tax_id, address, supplier_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, contact, phone, email, company_name, tax_id, address, supplier_type, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener todos los proveedores
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener un proveedor por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Supplier not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// UPDATE - Actualizar un proveedor (PUT - reemplaza todos los campos)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contact, phone, email, company_name, tax_id, address, supplier_type, status }: Partial<Supplier> = req.body;
    const result = await pool.query(
      `UPDATE suppliers
       SET name = $1, contact = $2, phone = $3, email = $4, company_name = $5, tax_id = $6, address = $7, supplier_type = $8, status = $9
       WHERE id = $10 RETURNING *`,
      [name, contact, phone, email, company_name, tax_id, address, supplier_type, status, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Supplier not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// PATCH - Actualizar parcialmente un proveedor
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<Supplier> = req.body;

    const existingSupplier = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const fields = Object.keys(updates).filter(key => key !== 'id');
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = fields.map(field => updates[field as keyof Partial<Supplier>]);

    const result = await pool.query(
      `UPDATE suppliers SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE - Eliminar un proveedor (desactivar)
// DELETE - Inactivar un proveedor (genérico)
router.post('/delete/:id', async (req: Request, res: Response) => {
  const supplierId = parseInt(req.params.id, 10); // Obtener el ID de la URL

  // Validar que el ID sea un número válido
  if (isNaN(supplierId)) {
    return res.status(400).json({ error: 'El ID del proveedor debe ser un número válido' });
  }

  try {
    // Actualizar el status a 'inactive' directamente
    const result = await pool.query(
      `UPDATE suppliers 
       SET status = 'inactive' 
       WHERE id = $1 
       RETURNING id, name, status`,
      [supplierId]
    );

    // Verificar si se actualizó algún registro
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `No se encontró un proveedor con ID ${supplierId}` });
    }

    res.status(200).json({ 
      message: `Proveedor con ID ${supplierId} desactivado correctamente`, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error al desactivar proveedor:', error);
    res.status(500).json({ 
      error: 'Error al intentar desactivar el proveedor', 
      details: (error as Error).message 
    });
  }
});

// POST - Crear una deuda con el supplier (simula una compra a crédito)
router.post('/:id/debts', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { total_amount }: { total_amount: number } = req.body;

    if (!total_amount || total_amount <= 0) {
      return res.status(400).json({ error: 'Total amount must be a positive number' });
    }

    const supplier = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (supplier.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const debt = await CreditService.createSupplierDebt(parseInt(id), total_amount);
    res.status(201).json({ message: 'Debt created successfully', debt });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST - Realizar un pago parcial de una deuda
router.post('/:id/debts/:debtId/pay', async (req: Request, res: Response) => {
  try {
    const { id, debtId } = req.params as { id: string; debtId: string };
    const { amount }: { amount: number } = req.body;

    if (!amount || amount < 10 || amount > 50) {
      return res.status(400).json({ error: 'Amount must be between 10 and 50' });
    }

    const supplier = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (supplier.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const payment = await CreditService.makeDebtPayment(parseInt(debtId), amount);
    res.json({ message: 'Payment made successfully', payment });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET - Obtener todas las deudas de un supplier
router.get('/:id/debts', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const result = await pool.query(
      `SELECT sd.*, (SELECT json_agg(dp.*)
                     FROM debt_payments dp
                     WHERE dp.debt_id = sd.id) as payments
       FROM supplier_debts sd
       WHERE sd.supplier_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST - Crear una consignación
router.post('/:id/consignments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { start_date, end_date, items }: { start_date: string; end_date: string; items: { product_id: number; quantity: number; price_at_time: number }[] } = req.body;

    if (!start_date || !end_date || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Start date, end date, and items are required' });
    }

    const supplier = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (supplier.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const consignment = await CreditService.createConsignment(parseInt(id), start_date, end_date, items);
    res.status(201).json({ message: 'Consignment created successfully', consignment });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET - Obtener todas las consignaciones de un supplier
router.get('/:id/consignments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const result = await pool.query(
      `SELECT c.*, (SELECT json_agg(ci.*)
                    FROM consignment_items ci
                    WHERE ci.consignment_id = c.id) as items
       FROM consignments c
       WHERE c.supplier_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST - Finalizar una consignación
router.post('/:id/consignments/:consignmentId/finalize', async (req: Request, res: Response) => {
  try {
    const { id, consignmentId } = req.params as { id: string; consignmentId: string };
    const supplier = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (supplier.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const consignment = await CreditService.finalizeConsignment(parseInt(consignmentId));
    res.json({ message: 'Consignment finalized successfully', consignment });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

