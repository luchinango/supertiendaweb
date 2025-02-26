import express, { Router, Request, Response } from 'express';
import pool from '../config/db';

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

// UPDATE - Actualizar un proveedor
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

    // Obtener el proveedor existente para mantener los valores no proporcionados
    const existingSupplier = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Construir la consulta dinámica con solo los campos proporcionados
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

export default router;