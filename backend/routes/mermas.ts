import express, { Router } from 'express';
import pool from '../config/db';

const router: Router = express.Router();

interface Merma {
  id?: number;
  product_id: number;
  quantity: number;
  type: 'vendido' | 'dañado' | 'perdido';
  date: string;
  value: number;
  responsible_id: number;
  observations?: string;
  product_name?: string;
  responsible_name?: string;
}

// CREATE - Registrar una merma
router.post('/', async (req: express.Request, res: express.Response): Promise<express.Response> => {
  try {
    const { product_id, quantity, type, date, value, responsible_id, observations }: Partial<Merma> = req.body;
    const result = await pool.query(
      `INSERT INTO mermas (product_id, quantity, type, date, value, responsible_id, observations)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [product_id, quantity, type, date, value, responsible_id, observations]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// CREATE - Agregar una merma adicional
router.post('/items', async (req: express.Request, res: express.Response): Promise<express.Response> => {
  try {
    const { product_id, quantity, type, date, value, responsible_id, observations }: Partial<Merma> = req.body;
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [product_id]);
    const responsible = await pool.query('SELECT * FROM users WHERE id = $1', [responsible_id]);

    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (responsible.rows.length === 0) {
      return res.status(404).json({ error: 'Responsible not found' });
    }

    const result = await pool.query(
      `INSERT INTO mermas (product_id, quantity, type, date, value, responsible_id, observations)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        product_id,
        quantity || 1,
        type || 'vendido',
        date || new Date().toISOString().split('T')[0],
        value || 0.00,
        responsible_id,
        observations || null,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener todas las mermas
router.get('/', async (req: express.Request, res: express.Response): Promise<express.Response> => {
  try {
    const result = await pool.query(
      `SELECT m.*, p.name AS product_name, u.first_name || ' ' || u.last_name AS responsible_name
       FROM mermas m
       JOIN products p ON m.product_id = p.id
       JOIN users u ON m.responsible_id = u.id`
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener una merma por ID
router.get('/:id', async (req: express.Request, res: express.Response): Promise<express.Response> => {
  try {
    const { id } = req.params as { id: string };
    const result = await pool.query(
      `SELECT m.*, p.name AS product_name, u.first_name || ' ' || u.last_name AS responsible_name
       FROM mermas m
       JOIN products p ON m.product_id = p.id
       JOIN users u ON m.responsible_id = u.id
       WHERE m.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Merma not found' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// UPDATE - Actualizar una merma
router.put('/:id', async (req: express.Request, res: express.Response): Promise<express.Response> => {
  try {
    const { id } = req.params;
    const { product_id, quantity, type, date, value, responsible_id, observations }: Partial<Merma> = req.body;
    const result = await pool.query(
      `UPDATE mermas
       SET product_id = $1, quantity = $2, type = $3, date = $4, value = $5, responsible_id = $6, observations = $7
       WHERE id = $8 RETURNING *`,
      [product_id, quantity, type, date, value, responsible_id, observations, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Merma not found' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE - Eliminar una merma
router.delete('/:id', async (req: express.Request, res: express.Response): Promise<express.Response> => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM mermas WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Merma not found' });
    }
    return res.json({ message: 'Merma deleted', merma: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;