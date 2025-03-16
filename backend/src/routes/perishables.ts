import express, { Request, Response } from 'express';
import pool from '../config/db';
import authMiddleware from '../middleware/auth';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.use(authenticate); // Todas las rutas después requieren token
router.use(authorize(["superuser", "system_admin"])); // Todas las rutas después requieren roles específicos


// Informe de productos perecederos vencidos
router.get('/report', authMiddleware.authenticate, async (_req: Request, res: Response) => {
  const currentDate = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD

  try {
    const result = await pool.query(`
      SELECT 
        p.id, 
        p.name, 
        p.expiration_date, 
        p.actual_stock, 
        p.sale_price, 
        p.is_organic,
        c.name AS category_name,
        CASE 
          WHEN p.expiration_date <= $1 THEN 'Vencido por fecha'
          WHEN p.is_organic AND k.movement_date IS NOT NULL THEN 
            CASE 
              WHEN AGE(CURRENT_DATE, k.movement_date) > INTERVAL '30 days' THEN 'Vencido como orgánico'
              ELSE 'Vigente'
            END
          ELSE 'Vigente'
        END AS status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN (
        SELECT product_id, MAX(movement_date) AS movement_date
        FROM kardex
        WHERE movement_type = 'entry'
        GROUP BY product_id
      ) k ON p.id = k.product_id
      WHERE p.actual_stock > 0 
        AND (p.expiration_date IS NOT NULL OR p.is_organic)
      ORDER BY p.expiration_date ASC, p.name ASC
    `, [currentDate]);

    const perishables = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      expirationDate: row.expiration_date,
      stock: row.actual_stock,
      salePrice: row.sale_price,
      isOrganic: row.is_organic,
      category: row.category_name,
      status: row.status,
      daysSinceEntry: row.movement_date ? Math.floor((new Date().getTime() - new Date(row.movement_date).getTime()) / (1000 * 60 * 60 * 24)) : null,
    }));

    res.json({
      message: 'Informe de perecederos generado exitosamente',
      data: perishables,
      totalVencidos: perishables.filter(p => p.status.startsWith('Vencido')).length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Opcional: Endpoint para verificar y registrar mermas automáticas (si no se deja en mermas.ts)
router.post('/check-expired', authMiddleware.authenticate, async (_req: Request, res: Response) => {
  const currentDate = new Date().toISOString().split('T')[0];

  try {
    await pool.query('BEGIN');

    const expiredProductsResult = await pool.query(`
      SELECT id, name, actual_stock, sale_price, expiration_date, is_organic
      FROM products
      WHERE actual_stock > 0
      AND (expiration_date <= $1 OR (is_organic AND EXISTS (
        SELECT 1 FROM kardex 
        WHERE product_id = products.id 
        AND movement_type = 'entry' 
        AND AGE(CURRENT_DATE, movement_date) > INTERVAL '30 days'
      )))
    `, [currentDate]);

    const expiredProducts = expiredProductsResult.rows;
    const mermasRegistradas: { product_id: number; quantity: number }[] = [];

    for (const product of expiredProducts) {
      const quantityToRemove = product.actual_stock;
      const mermaValue = product.sale_price * quantityToRemove;
      const reason = product.expiration_date <= currentDate 
        ? `Producto vencido (fecha: ${product.expiration_date})`
        : `Producto orgánico vencido (más de 30 días desde entrada)`;

      const mermaResult = await pool.query(
        `INSERT INTO mermas (product_id, quantity, type, date, value, observations, is_automated)
         VALUES ($1, $2, 'vencido', $3, $4, $5, true) RETURNING id`,
        [product.id, quantityToRemove, currentDate, mermaValue, reason]
      );
      const mermaId = mermaResult.rows[0].id;

      const kardexResult = await pool.query(
        `INSERT INTO kardex (product_id, movement_type, quantity, unit_price, reference_id, reference_type, stock_after)
         VALUES ($1, 'exit', $2, $3, $4, 'merma', $5) RETURNING id`,
        [product.id, quantityToRemove, product.sale_price, mermaId, 0]
      );
      const kardexId = kardexResult.rows[0].id;

      await pool.query('UPDATE mermas SET kardex_id = $1 WHERE id = $2', [kardexId, mermaId]);
      await pool.query('UPDATE products SET actual_stock = 0 WHERE id = $1', [product.id]);

      mermasRegistradas.push({ product_id: product.id, quantity: quantityToRemove });
    }

    await pool.query('COMMIT');
    res.json({
      message: 'Revisión de perecederos vencidos completada',
      mermasRegistradas,
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;