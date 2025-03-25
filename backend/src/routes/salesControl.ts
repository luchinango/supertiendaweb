import express, { Router, Request, Response } from 'express';
import pool from '../config/db'; // Asegúrate de que la ruta a tu configuración de DB sea correcta

const router: Router = express.Router();

// GET - Control de productos no vendidos
router.get('/sales-control', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id, 
        p.name, 
        p.barcode, 
        p.actual_stock,
        COALESCE(MAX(t.created_at), '2000-01-01'::timestamp) AS last_sale_date,
        CASE 
          WHEN COALESCE(MAX(t.created_at), '2000-01-01'::timestamp) < CURRENT_DATE - INTERVAL '2 months' THEN 'red'
          WHEN COALESCE(MAX(t.created_at), '2000-01-01'::timestamp) < CURRENT_DATE - INTERVAL '1 month' THEN 'orange'
          ELSE 'green'
        END AS status_color
      FROM products p
      LEFT JOIN transaction_items ti ON p.id = ti.product_id
      LEFT JOIN transactions t ON ti.transaction_id = t.id AND t.type IN ('cash', 'credit')
      GROUP BY p.id, p.name, p.barcode, p.actual_stock
      ORDER BY last_sale_date DESC;
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error en sales-control:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;