import express, { Request, Response } from 'express';
import pool from "../config/db";
import { authenticate, authorize } from "../middleware/auth";
import { Business, BusinessType } from '../models/business';

const router = express.Router();

// --- Business CRUD ---

router.use(authenticate); // Todas las rutas después requieren token
router.use(authorize(["superuser", "system_admin"])); // Todas las rutas después requieren roles específicos

// Crear un negocio
router.post(
  '/',
  async (req: Request, res: Response) => {
    const { name, description, address, tax_id, business_type_id } = req.body;

    if (!name || !tax_id || !business_type_id) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
      const result = await query(
        `INSERT INTO business (name, description, address, tax_id, business_type_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, description, address, tax_id, business_type_id]
      );
      const newBusiness: Business = result.rows[0];
      res.status(201).json(newBusiness);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el negocio' });
    }
  }
);

// Obtener todos los negocios
router.get(
  '/',
  async (req: Request, res: Response) => {
    try {
      const result = await query('SELECT * FROM business');
      const businesses: Business[] = result.rows;
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los negocios' });
    }
  }
);

// Obtener un negocio por ID
router.get(
  '/:businessId',
  async (req: Request, res: Response) => {
    const { businessId } = req.params;
    try {
      const result = await query('SELECT * FROM business WHERE id = $1', [
        businessId,
      ]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Negocio no encontrado' });
      }
      const business: Business = result.rows[0];
      res.json(business);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el negocio' });
    }
  }
);

// Actualizar un negocio
router.put(
  '/:businessId',
  async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const { name, description, address, tax_id, business_type_id } = req.body;

    if (!name || !tax_id || !business_type_id) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
      const result = await query(
        `UPDATE business SET name = $1, description = $2, address = $3, tax_id = $4, 
         business_type_id = $5, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $6 RETURNING *`,
        [name, description, address, tax_id, business_type_id, businessId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Negocio no encontrado' });
      }
      const updatedBusiness: Business = result.rows[0];
      res.json(updatedBusiness);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el negocio' });
    }
  }
);

// Eliminar (desactivar) un negocio
router.delete(
  '/:businessId',
  async (req: Request, res: Response) => {
    const { businessId } = req.params;
    try {
      const result = await query(
        `UPDATE business SET status = 'inactive', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 RETURNING *`,
        [businessId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Negocio no encontrado' });
      }
      res.json({ message: 'Negocio desactivado', data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: 'Error al desactivar el negocio' });
    }
  }
);

// --- Business Types ---

// Obtener tipos de negocio
router.get(
  '/types',
  async (req: Request, res: Response) => {
    try {
      const result = await query('SELECT * FROM business_types');
      const businessTypes: BusinessType[] = result.rows;
      res.json({ business_types: businessTypes });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los tipos de negocio' });
    }
  }
);

async function query(sql: string, params?: any[]) {
    try {
        const result = await pool.query(sql, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

export default router;
